import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignmentStatus, WorkspaceStatus, TeamRole, TaskStatus, TaskPriority, NoteType, FindingStatus } from '@prisma/client';

@Injectable()
export class ResearchWorkspaceService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── Helper: Enforce University Isolation ─────────────────────────────────────
  async getWorkspaceWithPermission(workspaceId: string, userId: string, userRole: string) {
    const workspace = await this.prisma.researchWorkspace.findUnique({
      where: { id: workspaceId },
      include: {
        assignment: {
          include: {
            challenge: {
              include: { media: true, analyses: true },
            },
            university: true,
          },
        },
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, email: true, role: true } },
              },
            },
          },
        },
        tasks: true,
        notes: true,
        evidence: true,
        references: true,
        findings: true,
        discussions: true,
      },
    });

    if (!workspace) throw new NotFoundException('Research workspace not found');

    // Platform Admin has read oversight
    if (userRole === 'PLATFORM_ADMIN') return workspace;

    // Check user university match
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { include: { university: true } } },
    });
    const userUniId = user?.organization?.university?.id;

    if (!userUniId || userUniId !== workspace.assignment.universityId) {
      throw new ForbiddenException('Access denied: Workspace belongs to another university');
    }

    return workspace;
  }

  // ─── Workspace Lifecycle ──────────────────────────────────────────────────────
  async createWorkspaceForAssignment(assignmentId: string, userId: string, title?: string, description?: string) {
    const assignment = await this.prisma.universityAssignment.findUnique({
      where: { id: assignmentId },
      include: { challenge: true },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.status !== AssignmentStatus.ACCEPTED) {
      throw new BadRequestException('Research workspace can only be created for ACCEPTED assignments');
    }

    // Check if workspace already exists
    const existing = await this.prisma.researchWorkspace.findUnique({
      where: { assignmentId },
    });
    if (existing) return existing;

    const workspace = await this.prisma.researchWorkspace.create({
      data: {
        assignmentId,
        title: title || `Research Workspace: ${assignment.challenge.title || assignment.challenge.challengeCode}`,
        description: description || `Collaborative research for challenge ${assignment.challenge.challengeCode}`,
        status: WorkspaceStatus.ACTIVE,
        team: {
          create: {
            name: `${assignment.challenge.challengeCode} Research Team`,
            description: 'Primary research team',
            facultyLeadId: userId,
            members: {
              create: {
                userId,
                role: TeamRole.FACULTY_LEAD,
              },
            },
          },
        },
      },
      include: { team: { include: { members: true } } },
    });

    // Create Audit Log
    await this.prisma.challengeAuditLog.create({
      data: {
        challengeId: assignment.challengeId,
        actorId: userId,
        action: 'WORKSPACE_CREATED',
        entityType: 'ResearchWorkspace',
        metadata: { workspaceId: workspace.id },
      },
    });

    return workspace;
  }

  async getWorkspacesForUser(userId: string, userRole: string) {
    if (userRole === 'PLATFORM_ADMIN') {
      return this.prisma.researchWorkspace.findMany({
        include: {
          assignment: { include: { challenge: true, university: true } },
          team: { include: { members: true } },
          tasks: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { include: { university: true } } },
    });
    const userUniId = user?.organization?.university?.id;
    if (!userUniId) return [];

    return this.prisma.researchWorkspace.findMany({
      where: {
        assignment: { universityId: userUniId },
      },
      include: {
        assignment: { include: { challenge: true, university: true } },
        team: { include: { members: true } },
        tasks: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async markReadyForSolution(workspaceId: string, userId: string, userRole: string) {
    const workspace = await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new BadRequestException('Workspace must be ACTIVE to mark ready for solution');
    }

    if (workspace.notes.length === 0) {
      throw new BadRequestException('Workspace must have at least one research note before marking ready for solution');
    }

    if (workspace.findings.length === 0 && workspace.evidence.length === 0) {
      throw new BadRequestException('Workspace must have at least one finding or evidence artifact');
    }

    const updated = await this.prisma.researchWorkspace.update({
      where: { id: workspaceId },
      data: { status: WorkspaceStatus.READY_FOR_SOLUTION },
    });

    await this.prisma.challengeAuditLog.create({
      data: {
        challengeId: workspace.assignment.challengeId,
        actorId: userId,
        action: 'WORKSPACE_READY_FOR_SOLUTION',
        entityType: 'ResearchWorkspace',
        metadata: { workspaceId },
      },
    });

    return updated;
  }

  // ─── Team Management ──────────────────────────────────────────────────────────
  async addTeamMember(workspaceId: string, memberUserId: string, role: TeamRole, requestingUserId: string, userRole: string) {
    const workspace = await this.getWorkspaceWithPermission(workspaceId, requestingUserId, userRole);

    if (!workspace.team) throw new NotFoundException('Research team not found for this workspace');

    // Server-side check: target user MUST belong to the SAME university
    const targetUser = await this.prisma.user.findUnique({
      where: { id: memberUserId },
      include: { organization: { include: { university: true } } },
    });

    if (!targetUser) throw new NotFoundException('User to add not found');
    const targetUniId = targetUser.organization?.university?.id;

    if (targetUniId !== workspace.assignment.universityId) {
      throw new ForbiddenException('Cannot add users from another university');
    }

    const existingMember = await this.prisma.researchTeamMember.findUnique({
      where: { teamId_userId: { teamId: workspace.team.id, userId: memberUserId } },
    });
    if (existingMember) throw new BadRequestException('User is already a team member');

    const member = await this.prisma.researchTeamMember.create({
      data: {
        teamId: workspace.team.id,
        userId: memberUserId,
        role,
      },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    await this.notifications.create({
      userId: memberUserId,
      title: 'Added to Research Team',
      body: `You have been added as ${role} to research team: ${workspace.title}`,
      type: 'TEAM_MEMBER_ADDED',
      entityId: workspaceId,
    });

    return member;
  }

  async removeTeamMember(workspaceId: string, memberUserId: string, requestingUserId: string, userRole: string) {
    const workspace = await this.getWorkspaceWithPermission(workspaceId, requestingUserId, userRole);
    if (!workspace.team) throw new NotFoundException('Team not found');

    return this.prisma.researchTeamMember.delete({
      where: { teamId_userId: { teamId: workspace.team.id, userId: memberUserId } },
    });
  }

  async getEligibleUniversityMembers(workspaceId: string, requestingUserId: string, userRole: string) {
    const workspace = await this.getWorkspaceWithPermission(workspaceId, requestingUserId, userRole);
    const uniId = workspace.assignment.universityId;

    return this.prisma.user.findMany({
      where: {
        organization: { university: { id: uniId } },
      },
      select: { id: true, email: true, role: true },
    });
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────────
  async createTask(workspaceId: string, dto: { title: string; description?: string; assignedTo?: string; priority?: TaskPriority; dueDate?: Date }, userId: string, userRole: string) {
    const workspace = await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    const task = await this.prisma.researchTask.create({
      data: {
        workspaceId,
        title: dto.title,
        description: dto.description,
        assignedTo: dto.assignedTo,
        createdBy: userId,
        priority: dto.priority || TaskPriority.MEDIUM,
        dueDate: dto.dueDate,
        status: TaskStatus.TODO,
      },
    });

    if (dto.assignedTo) {
      await this.notifications.create({
        userId: dto.assignedTo,
        title: 'New Task Assigned',
        body: `Task "${dto.title}" assigned to you in ${workspace.title}`,
        type: 'TASK_ASSIGNED',
        entityId: workspaceId,
      });
    }

    return task;
  }

  async updateTask(workspaceId: string, taskId: string, dto: { title?: string; description?: string; assignedTo?: string; status?: TaskStatus; priority?: TaskPriority }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchTask.update({
      where: { id: taskId },
      data: dto,
    });
  }

  // ─── Research Notes ───────────────────────────────────────────────────────────
  async createNote(workspaceId: string, dto: { title: string; content: string; noteType?: NoteType }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchNote.create({
      data: {
        workspaceId,
        authorId: userId,
        title: dto.title,
        content: dto.content,
        noteType: dto.noteType || NoteType.GENERAL,
      },
    });
  }

  async updateNote(workspaceId: string, noteId: string, dto: { title?: string; content?: string; noteType?: NoteType }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchNote.update({
      where: { id: noteId },
      data: dto,
    });
  }

  // ─── Evidence & References ─────────────────────────────────────────────────────
  async createEvidence(workspaceId: string, dto: { title: string; description?: string; type?: string; storageKey: string; mimeType: string; fileSize: number }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchEvidence.create({
      data: {
        workspaceId,
        uploadedBy: userId,
        title: dto.title,
        description: dto.description,
        type: dto.type || 'DOCUMENT',
        storageKey: dto.storageKey,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
      },
    });
  }

  async createReference(workspaceId: string, dto: { title: string; url?: string; citation?: string; description?: string }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchReference.create({
      data: {
        workspaceId,
        addedBy: userId,
        title: dto.title,
        url: dto.url,
        citation: dto.citation,
        description: dto.description,
      },
    });
  }

  // ─── Findings & Discussions ────────────────────────────────────────────────────
  async createFinding(workspaceId: string, dto: { title: string; description: string; evidenceIds?: string[]; status?: FindingStatus }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchFinding.create({
      data: {
        workspaceId,
        createdBy: userId,
        title: dto.title,
        description: dto.description,
        evidenceIds: dto.evidenceIds || [],
        status: dto.status || FindingStatus.DRAFT,
      },
    });
  }

  async updateFinding(workspaceId: string, findingId: string, dto: { title?: string; description?: string; status?: FindingStatus }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchFinding.update({
      where: { id: findingId },
      data: dto,
    });
  }

  async createDiscussion(workspaceId: string, dto: { content: string; parentId?: string }, userId: string, userRole: string) {
    await this.getWorkspaceWithPermission(workspaceId, userId, userRole);

    return this.prisma.researchDiscussion.create({
      data: {
        workspaceId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId,
      },
    });
  }
}
