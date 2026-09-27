import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type AuditAction =
  | 'CHALLENGE_CREATED'
  | 'AI_ANALYSIS_CREATED'
  | 'CHALLENGE_EDITED'
  | 'CHALLENGE_SUBMITTED'
  | 'CHALLENGE_WITHDRAWN'
  | 'MEDIA_UPLOADED';

export interface AuditLogParams {
  actorId: string;
  action: AuditAction;
  challengeId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.challengeAuditLog.create({
        data: {
          challengeId: params.challengeId,
          actorId: params.actorId,
          action: params.action,
          entityType: 'Challenge',
          metadata: params.metadata as any,
        },
      });
    } catch (err: unknown) {
      // Audit failures must never break the main flow
      this.logger.error(`Audit log failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
