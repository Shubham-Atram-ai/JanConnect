import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { StorageProvider } from '../storage/storage.provider.interface';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatus, MediaType } from '@prisma/client';

// ─── Allowed MIME types ────────────────────────────────────────────────────
const ALLOWED_MIME: Record<MediaType, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  AUDIO: ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg'],
  DOCUMENT: ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_SIZE: Record<MediaType, number> = {
  IMAGE: 10 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
  AUDIO: 20 * 1024 * 1024,
  DOCUMENT: 15 * 1024 * 1024,
};

function detectMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
}

@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly storage: StorageProvider,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Code Generation ─────────────────────────────────────────────────────

  private async generateChallengeCode(): Promise<string> {
    const count = await this.prisma.challenge.count();
    const num = String(count + 1).padStart(4, '0');
    return `JC-${num}`;
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async create(citizenId: string, dto: CreateChallengeDto) {
    const challengeCode = await this.generateChallengeCode();

    const challenge = await this.prisma.challenge.create({
      data: {
        challengeCode,
        citizenId,
        status: ChallengeStatus.DRAFT,
        ...dto,
      },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'CHALLENGE_CREATED',
      challengeId: challenge.id,
      metadata: { challengeCode },
    });

    return challenge;
  }

  async findAll(citizenId: string) {
    return this.prisma.challenge.findMany({
      where: { citizenId },
      include: {
        _count: { select: { media: true, analyses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, citizenId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        media: true,
        analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    // IDOR protection: 404 if not found OR not owned by citizen
    if (!challenge || challenge.citizenId !== citizenId) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async update(id: string, citizenId: string, dto: UpdateChallengeDto) {
    await this.assertOwnerAndStatus(id, citizenId, ChallengeStatus.DRAFT);

    const challenge = await this.prisma.challenge.update({
      where: { id },
      data: { ...dto },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'CHALLENGE_EDITED',
      challengeId: id,
      metadata: { fields: Object.keys(dto) },
    });

    return challenge;
  }

  // ─── AI Analysis ──────────────────────────────────────────────────────────

  async analyzeText(id: string, citizenId: string, text: string, language = 'en') {
    const challenge = await this.assertOwner(id, citizenId);

    // Security: Citizen text treated as data, not instructions
    const result = await this.ai.processText(text, language);

    const analysisRecord = await this.prisma.challengeAnalysis.create({
      data: {
        challengeId: id,
        provider: result.provider,
        model: 'mock',
        modelVersion: '1.0',
        outputJson: result.analysis as any,
        confidence: result.analysis.confidence,
        isFallback: result.isFallback,
      },
    });

    // Update challenge with AI suggestions (but preserve original input)
    await this.prisma.challenge.update({
      where: { id },
      data: {
        originalTranscript: text,
        normalizedText: result.normalizedText,
        originalLanguage: language,
        // Populate editable fields with AI suggestions
        title: result.analysis.title,
        summary: result.analysis.summary,
        domain: result.analysis.domain,
        subdomain: result.analysis.subdomain,
        problemType: result.analysis.problemType,
        requiredSkills: result.analysis.requiredSkills,
        tags: result.analysis.tags,
        affectedPopulation: result.analysis.affectedPopulation ?? undefined,
      },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'AI_ANALYSIS_CREATED',
      challengeId: id,
      metadata: {
        provider: result.provider,
        confidence: result.analysis.confidence,
        isFallback: result.isFallback,
      },
    });

    // Notify citizen
    await this.notifications.create({
      userId: citizenId,
      title: 'AI analysis complete',
      body: `Your problem has been analyzed: "${result.analysis.title}"`,
      type: 'AI_ANALYSIS_COMPLETE',
      entityId: id,
    });

    return {
      challenge: await this.findOne(id, citizenId),
      analysis: analysisRecord,
      aiResult: result,
    };
  }

  async analyzeVoice(
    id: string,
    citizenId: string,
    file: Express.Multer.File,
    language?: string,
  ) {
    await this.assertOwner(id, citizenId);

    // Validate audio
    const mediaType = detectMediaType(file.mimetype);
    if (mediaType !== 'AUDIO') {
      throw new BadRequestException('Only audio files are accepted for voice input');
    }
    this.validateFile(file, 'AUDIO');

    // Store audio
    const audioKey = `challenges/${id}/audio/${Date.now()}-${file.originalname}`;
    const stored = await this.storage.upload({
      buffer: file.buffer,
      key: audioKey,
      mimeType: file.mimetype,
    });

    // Save media record
    await this.prisma.challengeMedia.create({
      data: {
        challengeId: id,
        type: 'AUDIO',
        storageKey: stored.key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'MEDIA_UPLOADED',
      challengeId: id,
      metadata: { type: 'AUDIO', key: audioKey },
    });

    // Process through AI pipeline
    const result = await this.ai.processAudio({ bucket: 'janconnect-media', key: audioKey });

    const analysisRecord = await this.prisma.challengeAnalysis.create({
      data: {
        challengeId: id,
        provider: result.provider,
        model: 'mock',
        modelVersion: '1.0',
        inputRef: audioKey,
        outputJson: result.analysis as any,
        confidence: result.analysis.confidence,
        isFallback: result.isFallback,
      },
    });

    await this.prisma.challenge.update({
      where: { id },
      data: {
        originalAudioRef: audioKey,
        originalTranscript: result.originalTranscript,
        originalLanguage: result.detectedLanguage,
        normalizedText: result.normalizedText,
        title: result.analysis.title,
        summary: result.analysis.summary,
        domain: result.analysis.domain,
        subdomain: result.analysis.subdomain,
        problemType: result.analysis.problemType,
        requiredSkills: result.analysis.requiredSkills,
        tags: result.analysis.tags,
        affectedPopulation: result.analysis.affectedPopulation ?? undefined,
      },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'AI_ANALYSIS_CREATED',
      challengeId: id,
      metadata: { provider: result.provider, confidence: result.analysis.confidence },
    });

    await this.notifications.create({
      userId: citizenId,
      title: 'Voice analysis complete',
      body: `Your spoken problem has been transcribed and analyzed: "${result.analysis.title}"`,
      type: 'AI_ANALYSIS_COMPLETE',
      entityId: id,
    });

    return {
      challenge: await this.findOne(id, citizenId),
      analysis: analysisRecord,
      aiResult: result,
    };
  }

  // ─── Media Upload ─────────────────────────────────────────────────────────

  async uploadMedia(id: string, citizenId: string, file: Express.Multer.File) {
    await this.assertOwner(id, citizenId);

    const mediaType = detectMediaType(file.mimetype);
    this.validateFile(file, mediaType);

    const key = `challenges/${id}/media/${Date.now()}-${file.originalname}`;
    const stored = await this.storage.upload({
      buffer: file.buffer,
      key,
      mimeType: file.mimetype,
    });

    const media = await this.prisma.challengeMedia.create({
      data: {
        challengeId: id,
        type: mediaType,
        storageKey: stored.key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'MEDIA_UPLOADED',
      challengeId: id,
      metadata: { type: mediaType, key },
    });

    return media;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async submit(id: string, citizenId: string) {
    const challenge = await this.assertOwnerAndStatus(id, citizenId, ChallengeStatus.DRAFT);

    // Require title or transcript
    if (!challenge.title && !challenge.originalTranscript && !challenge.normalizedText) {
      throw new BadRequestException(
        'Challenge must have a title or problem description before submitting',
      );
    }

    const submitted = await this.prisma.challenge.update({
      where: { id },
      data: { status: ChallengeStatus.SUBMITTED },
    });

    await this.audit.log({
      actorId: citizenId,
      action: 'CHALLENGE_SUBMITTED',
      challengeId: id,
      metadata: { challengeCode: submitted.challengeCode },
    });

    await this.notifications.create({
      userId: citizenId,
      title: 'Problem submitted successfully',
      body: `Your problem ${submitted.challengeCode} has been submitted. AI university matching will begin soon.`,
      type: 'CHALLENGE_SUBMITTED',
      entityId: id,
    });

    return {
      challengeId: submitted.id,
      challengeCode: submitted.challengeCode,
      status: submitted.status,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async assertOwner(id: string, citizenId: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    if (!challenge || challenge.citizenId !== citizenId) {
      throw new NotFoundException('Challenge not found');
    }
    return challenge;
  }

  private async assertOwnerAndStatus(
    id: string,
    citizenId: string,
    expectedStatus: ChallengeStatus,
  ) {
    const challenge = await this.assertOwner(id, citizenId);
    if (challenge.status !== expectedStatus) {
      throw new BadRequestException(
        `Challenge must be in ${expectedStatus} status for this operation`,
      );
    }
    return challenge;
  }

  async getSolutionsForChallenge(id: string, citizenId: string) {
    const challenge = await this.assertOwner(id, citizenId);
    return this.prisma.solution.findMany({
      where: {
        workspace: { assignment: { challengeId: challenge.id } },
        status: 'SUBMITTED',
      },
      include: {
        workspace: {
          include: {
            assignment: { include: { university: { include: { organization: true } } } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSolutionById(solutionId: string, citizenId: string) {
    const solution = await this.prisma.solution.findUnique({
      where: { id: solutionId },
      include: {
        workspace: {
          include: {
            assignment: { include: { challenge: true, university: { include: { organization: true } } } },
            team: { include: { members: { include: { user: true } } } },
            findings: { where: { status: 'CONFIRMED' } },
            evidence: true,
            references: true,
          },
        },
      },
    });

    if (!solution || solution.workspace.assignment.challenge.citizenId !== citizenId) {
      throw new NotFoundException('Solution not found');
    }
    
    if (solution.status !== 'SUBMITTED') {
      throw new ForbiddenException('Solution is not submitted yet');
    }

    return solution;
  }

  private validateFile(file: Express.Multer.File, type: MediaType): void {
    const allowedMimes = ALLOWED_MIME[type];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed for ${type}`,
      );
    }
    if (file.size > MAX_SIZE[type]) {
      throw new BadRequestException(
        `File too large: max ${MAX_SIZE[type] / 1024 / 1024}MB for ${type}`,
      );
    }
  }
}
