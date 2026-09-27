import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MatchingScorer, ChallengeRequirements, UniversityCapability, MIN_MATCH_SCORE } from './matching.scorer';
import { AssignmentStatus, ChallengeStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MatchingService {
  private scorer = new MatchingScorer();

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async generateMatches(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.SUBMITTED && challenge.status !== ChallengeStatus.MATCHING && challenge.status !== ChallengeStatus.MATCHED) {
       throw new BadRequestException('Challenge must be submitted to be matched');
    }

    // Update status to MATCHING
    if (challenge.status === ChallengeStatus.SUBMITTED) {
      await this.prisma.challenge.update({
        where: { id: challenge.id },
        data: { status: ChallengeStatus.MATCHING },
      });
      
      await this.prisma.challengeAuditLog.create({
        data: {
          challengeId: challenge.id,
          actorId: challenge.citizenId, // system implicitly acting on behalf
          action: 'MATCHING_STARTED',
        }
      });
    }

    const requirements: ChallengeRequirements = {
      domain: challenge.domain,
      subdomain: challenge.subdomain,
      requiredSkills: challenge.requiredSkills || [],
      tags: challenge.tags || [],
      state: challenge.state,
      district: challenge.district,
    };

    const universities = await this.prisma.university.findMany({
      include: {
        faculties: true,
        facilities: true,
        projects: true,
      }
    });

    const recommendations = [];

    for (const uni of universities) {
      const capability: UniversityCapability = {
        university: uni,
        faculties: uni.faculties,
        facilities: uni.facilities,
        projects: uni.projects,
      };

      const result = this.scorer.calculateScore(requirements, capability);
      if (result.totalScore >= MIN_MATCH_SCORE) {
        recommendations.push(result);
      }
    }

    // Rank descending
    recommendations.sort((a, b) => b.totalScore - a.totalScore);

    // Save recommendations as UniversityAssignment (RECOMMENDED state)
    // Idempotent: use upsert
    for (const rec of recommendations) {
      await this.prisma.universityAssignment.upsert({
        where: {
          challengeId_universityId: {
            challengeId: challenge.id,
            universityId: rec.universityId,
          }
        },
        update: {
          matchScore: rec.totalScore,
          matchBreakdown: rec.breakdown as any,
          matchExplanation: rec.explanation,
        },
        create: {
          challengeId: challenge.id,
          universityId: rec.universityId,
          status: AssignmentStatus.RECOMMENDED,
          matchScore: rec.totalScore,
          matchBreakdown: rec.breakdown as any,
          matchExplanation: rec.explanation,
        }
      });
    }

    await this.prisma.challenge.update({
      where: { id: challenge.id },
      data: { status: ChallengeStatus.MATCHED },
    });

    await this.prisma.challengeAuditLog.create({
      data: {
        challengeId: challenge.id,
        actorId: challenge.citizenId,
        action: 'MATCHING_COMPLETED',
        metadata: { recommendationsCount: recommendations.length }
      }
    });

    return recommendations;
  }

  async getMatches(challengeId: string) {
    return this.prisma.universityAssignment.findMany({
      where: { challengeId, status: AssignmentStatus.RECOMMENDED },
      orderBy: { matchScore: 'desc' },
      include: {
        university: {
          include: { organization: true }
        }
      }
    });
  }

  async distributeAssignments(challengeId: string, universityIds: string[], actorId: string) {
    if (universityIds.length > 5) {
      throw new BadRequestException('Cannot distribute to more than 5 universities');
    }

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        assignments: {
          where: {
            status: { notIn: [AssignmentStatus.RECOMMENDED, AssignmentStatus.EXPIRED] }
          }
        }
      }
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const currentActiveCount = challenge.assignments.length;
    if (currentActiveCount + universityIds.length > 5) {
      throw new ConflictException(`Cannot distribute to ${universityIds.length} more universities. Currently active: ${currentActiveCount}. Limit is 5.`);
    }

    // Transaction-safe distribution
    await this.prisma.$transaction(async (prisma) => {
      for (const uniId of universityIds) {
        // Validate recommendation exists
        const recommendation = await prisma.universityAssignment.findUnique({
          where: {
             challengeId_universityId: { challengeId, universityId: uniId }
          },
          include: { university: true }
        });

        if (!recommendation) {
           throw new BadRequestException(`University ${uniId} was not recommended for this challenge.`);
        }
        
        if (recommendation.status !== AssignmentStatus.RECOMMENDED) {
           continue; // Already sent or declined
        }

        // Send
        await prisma.universityAssignment.update({
          where: { id: recommendation.id },
          data: {
             status: AssignmentStatus.SENT,
             assignedAt: new Date(),
          }
        });

        // Add to active capacity
        await prisma.university.update({
          where: { id: uniId },
          data: { activeAssignments: { increment: 1 } }
        });

        // Audit log
        await prisma.challengeAuditLog.create({
           data: {
             challengeId,
             actorId,
             action: 'ASSIGNMENT_SENT',
             metadata: { universityId: uniId, matchScore: recommendation.matchScore }
           }
        });

        // Notify University Admin
        const uniAdmins = await prisma.user.findMany({
           where: { organizationId: recommendation.university.organizationId, role: 'UNIVERSITY_ADMIN' }
        });
        
        for (const admin of uniAdmins) {
           await this.notifications.create({
             userId: admin.id,
             title: `New Challenge Assigned`,
             body: `Challenge ${challenge.challengeCode} has been distributed to your university.`,
             type: 'CHALLENGE_ASSIGNED',
             entityId: challengeId
           });
        }
      }

      // Update challenge status if it's the first distributions
      if (challenge.status === ChallengeStatus.MATCHED) {
         await prisma.challenge.update({
           where: { id: challengeId },
           data: { status: ChallengeStatus.DISTRIBUTED }
         });
      }
      
      // Notify citizen
      await this.notifications.create({
         userId: challenge.citizenId,
         title: `Problem distributed`,
         body: `Your problem ${challenge.challengeCode} has been distributed to ${universityIds.length} universities.`,
         type: 'CHALLENGE_DISTRIBUTED',
         entityId: challengeId
      });
    });

    return { success: true, count: universityIds.length };
  }
}
