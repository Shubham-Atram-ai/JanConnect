import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SolutionStatus, WorkspaceStatus, AssignmentStatus } from '@prisma/client';

@Injectable()
export class SolutionService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  async getSolution(assignmentId: string, universityId: string) {
    const solution = await this.prisma.solution.findUnique({
      where: { assignmentId },
      include: {
        workspace: {
          include: {
            assignment: true,
            findings: { where: { status: 'CONFIRMED' } },
            evidence: true,
            references: true,
          }
        }
      }
    });

    if (solution && solution.workspace.assignment.universityId !== universityId) {
      throw new ForbiddenException('Cannot access solution from another university');
    }

    return solution;
  }

  async createOrUpdateDraft(assignmentId: string, universityId: string, dto: any, userId: string) {
    const workspace = await this.prisma.researchWorkspace.findUnique({
      where: { assignmentId },
      include: { assignment: true }
    });

    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.assignment.universityId !== universityId) {
      throw new ForbiddenException('Cannot access workspace from another university');
    }
    
    if (workspace.assignment.status !== AssignmentStatus.ACCEPTED) {
      throw new BadRequestException('Assignment must be accepted');
    }
    
    if (workspace.status !== WorkspaceStatus.READY_FOR_SOLUTION) {
      throw new BadRequestException('Workspace is not ready for solution');
    }

    // Check if team member and role is allowed to edit
    const member = await this.prisma.researchTeamMember.findFirst({
      where: {
        team: { workspaceId: workspace.id },
        userId: userId,
        isActive: true,
      }
    });

    if (!member) throw new ForbiddenException('Not a team member');
    if (['STUDENT'].includes(member.role)) {
      throw new ForbiddenException('Students cannot edit solutions');
    }

    let solution = await this.prisma.solution.findUnique({ where: { assignmentId } });
    if (solution && solution.status === SolutionStatus.SUBMITTED) {
      throw new BadRequestException('Cannot edit a submitted solution');
    }

    if (!solution) {
      solution = await this.prisma.solution.create({
        data: {
          assignmentId,
          workspaceId: workspace.id,
          title: dto.title || '',
          summary: dto.summary || '',
          problemStatement: dto.problemStatement || '',
          proposedApproach: dto.proposedApproach || '',
          methodology: dto.methodology || '',
          implementationPlan: dto.implementationPlan || '',
          requiredResources: dto.requiredResources || '',
          expectedOutcome: dto.expectedOutcome || '',
          expectedImpact: dto.expectedImpact || '',
          limitations: dto.limitations || '',
          futureWork: dto.futureWork || '',
          status: SolutionStatus.DRAFT,
        }
      });

      await this.prisma.challengeAuditLog.create({
        data: {
          challengeId: workspace.assignment.challengeId,
          actorId: userId,
          action: 'SOLUTION_CREATED',
          metadata: { assignmentId, solutionId: solution.id }
        }
      });
    } else {
      solution = await this.prisma.solution.update({
        where: { id: solution.id },
        data: {
          title: dto.title ?? solution.title,
          summary: dto.summary ?? solution.summary,
          problemStatement: dto.problemStatement ?? solution.problemStatement,
          proposedApproach: dto.proposedApproach ?? solution.proposedApproach,
          methodology: dto.methodology ?? solution.methodology,
          implementationPlan: dto.implementationPlan ?? solution.implementationPlan,
          requiredResources: dto.requiredResources ?? solution.requiredResources,
          expectedOutcome: dto.expectedOutcome ?? solution.expectedOutcome,
          expectedImpact: dto.expectedImpact ?? solution.expectedImpact,
          limitations: dto.limitations ?? solution.limitations,
          futureWork: dto.futureWork ?? solution.futureWork,
        }
      });

      await this.prisma.challengeAuditLog.create({
        data: {
          challengeId: workspace.assignment.challengeId,
          actorId: userId,
          action: 'SOLUTION_UPDATED',
          metadata: { assignmentId, solutionId: solution.id }
        }
      });
    }

    return solution;
  }

  async submitSolution(assignmentId: string, universityId: string, userId: string) {
    const solution = await this.prisma.solution.findUnique({
      where: { assignmentId },
      include: {
        workspace: {
          include: { assignment: true, findings: true, evidence: true }
        }
      }
    });

    if (!solution) throw new NotFoundException('Solution draft not found');
    if (solution.workspace.assignment.universityId !== universityId) {
      throw new ForbiddenException('Unauthorized');
    }

    if (solution.status === SolutionStatus.SUBMITTED) {
      throw new BadRequestException('Solution is already submitted');
    }

    // Minimum submission requirements
    if (!solution.title || !solution.summary || !solution.proposedApproach || !solution.methodology || !solution.implementationPlan) {
      throw new BadRequestException('Solution is missing required fields (title, summary, approach, methodology, plan)');
    }

    if (solution.workspace.findings.length === 0 && solution.workspace.evidence.length === 0) {
      throw new BadRequestException('Solution must be backed by at least one finding or evidence');
    }

    // Verify authorized role (e.g. FACULTY_LEAD)
    const member = await this.prisma.researchTeamMember.findFirst({
      where: {
        team: { workspaceId: solution.workspaceId },
        userId: userId,
        isActive: true,
      }
    });
    
    if (!member) throw new ForbiddenException('Not a team member');
    if (member.role !== 'FACULTY_LEAD') {
      throw new ForbiddenException('Only the Faculty Lead can submit the final solution');
    }

    const updated = await this.prisma.solution.update({
      where: { id: solution.id },
      data: {
        status: SolutionStatus.SUBMITTED,
        submittedAt: new Date(),
      }
    });

    // Audit
    await this.prisma.challengeAuditLog.create({
      data: {
        challengeId: solution.workspace.assignment.challengeId,
        actorId: userId,
        action: 'SOLUTION_SUBMITTED',
        metadata: { assignmentId, solutionId: solution.id }
      }
    });

    // Notify Platform Admin
    const admins = await this.prisma.user.findMany({ where: { role: 'PLATFORM_ADMIN' } });
    for (const admin of admins) {
      await this.notifications.create({ userId: admin.id, title: 'Solution Submitted', body: 'A university has submitted a solution.', type: 'SOLUTION_SUBMITTED', entityId: solution.id });
    }
    
    // Notify Citizen
    const challenge = await this.prisma.challenge.findUnique({ where: { id: solution.workspace.assignment.challengeId } });
    if (challenge) {
      await this.notifications.create({ userId: challenge.citizenId, title: 'Solution Received', body: 'A university has proposed a solution for your problem.', type: 'SOLUTION_SUBMITTED', entityId: solution.id });
    }

    return updated;
  }

  async getUniversitySolutions(universityId: string) {
    return this.prisma.solution.findMany({
      where: {
        workspace: { assignment: { universityId } }
      },
      include: {
        workspace: { include: { assignment: { include: { challenge: true } } } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getUniversitySolutionById(solutionId: string, universityId: string) {
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
          }
        }
      }
    });
    if (!solution) throw new NotFoundException('Solution not found');
    if (solution.workspace.assignment.universityId !== universityId) {
      throw new ForbiddenException('Unauthorized');
    }
    return solution;
  }
}
