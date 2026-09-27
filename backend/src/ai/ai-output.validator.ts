import { BadRequestException } from '@nestjs/common';
import { ChallengeAnalysisOutput } from './providers/intelligence.provider.interface';

// ─── Allowed Domain Vocabulary ─────────────────────────────────────────────
export const ALLOWED_DOMAINS = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water',
  'Sanitation',
  'Environment',
  'Accessibility',
  'Infrastructure',
  'Public Services',
  'Energy',
] as const;

export type AllowedDomain = (typeof ALLOWED_DOMAINS)[number];

// ─── Confidence Bands ──────────────────────────────────────────────────────
export const CONFIDENCE = {
  LOW: 0.5,
  MEDIUM: 0.75,
} as const;

export type ConfidenceBand = 'LOW' | 'MEDIUM' | 'HIGH';

export function getConfidenceBand(confidence: number): ConfidenceBand {
  if (confidence < CONFIDENCE.LOW) return 'LOW';
  if (confidence < CONFIDENCE.MEDIUM) return 'MEDIUM';
  return 'HIGH';
}

// ─── Validation ────────────────────────────────────────────────────────────

const MAX_TITLE_LEN = 200;
const MAX_SUMMARY_LEN = 2000;
const MAX_SKILLS = 20;
const MAX_TAGS = 20;

export function validateAiOutput(output: unknown): ChallengeAnalysisOutput {
  if (!output || typeof output !== 'object') {
    throw new BadRequestException('AI output must be an object');
  }

  const o = output as Record<string, unknown>;

  // Required string fields
  if (typeof o.title !== 'string' || o.title.trim().length === 0) {
    throw new BadRequestException('AI output: title is required');
  }
  if (o.title.length > MAX_TITLE_LEN) {
    throw new BadRequestException(`AI output: title exceeds ${MAX_TITLE_LEN} chars`);
  }

  if (typeof o.summary !== 'string' || o.summary.trim().length === 0) {
    throw new BadRequestException('AI output: summary is required');
  }
  if (o.summary.length > MAX_SUMMARY_LEN) {
    throw new BadRequestException(`AI output: summary exceeds ${MAX_SUMMARY_LEN} chars`);
  }

  // Domain validation
  if (typeof o.domain !== 'string') {
    throw new BadRequestException('AI output: domain is required');
  }
  if (!ALLOWED_DOMAINS.includes(o.domain as AllowedDomain)) {
    // Map to "Public Services" as fallback
    (o as any).domain = 'Public Services';
  }

  // Arrays
  if (!Array.isArray(o.requiredSkills) || o.requiredSkills.length > MAX_SKILLS) {
    throw new BadRequestException('AI output: requiredSkills must be array (max 20)');
  }
  if (!Array.isArray(o.tags) || o.tags.length > MAX_TAGS) {
    throw new BadRequestException('AI output: tags must be array (max 20)');
  }

  // Confidence
  if (typeof o.confidence !== 'number' || o.confidence < 0 || o.confidence > 1) {
    throw new BadRequestException('AI output: confidence must be between 0 and 1');
  }

  return o as unknown as ChallengeAnalysisOutput;
}
