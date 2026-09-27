import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ResearchWorkspaceService } from './research-workspace.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentStatus, WorkspaceStatus, TeamRole, TaskStatus, NoteType } from '@prisma/client';

describe('ResearchWorkspaceService', () => {
  let service: ResearchWorkspaceService;
  let prisma: any;
  let notifications: any;

  const mockPrisma = {
    researchWorkspace: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    universityAssignment: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    researchTeamMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    researchTask: {
      create: jest.fn(),
      update: jest.fn(),
    },
    researchNote: {
      create: jest.fn(),
      update: jest.fn(),
    },
    researchEvidence: {
      create: jest.fn(),
    },
    researchReference: {
      create: jest.fn(),
    },
    researchFinding: {
      create: jest.fn(),
      update: jest.fn(),
    },
    researchDiscussion: {
      create: jest.fn(),
    },
    challengeAuditLog: {
      create: jest.fn(),
    },
  };

  const mockNotifications = {
    create: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchWorkspaceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<ResearchWorkspaceService>(ResearchWorkspaceService);
    prisma = module.get(PrismaService);
    notifications = module.get(NotificationsService);

    jest.clearAllMocks();
  });

  describe('createWorkspaceForAssignment', () => {
    it('should throw BadRequestException if assignment is not ACCEPTED', async () => {
      mockPrisma.universityAssignment.findUnique.mockResolvedValue({
        id: 'asg-1',
        status: AssignmentStatus.SENT,
        challenge: { challengeCode: 'JC-0001' },
      });

      await expect(
        service.createWorkspaceForAssignment('asg-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create workspace successfully when assignment is ACCEPTED', async () => {
      mockPrisma.universityAssignment.findUnique.mockResolvedValue({
        id: 'asg-1',
        challengeId: 'ch-1',
        status: AssignmentStatus.ACCEPTED,
        challenge: { challengeCode: 'JC-0001', title: 'Crop Waterlogging' },
      });
      mockPrisma.researchWorkspace.findUnique.mockResolvedValue(null);
      mockPrisma.researchWorkspace.create.mockResolvedValue({
        id: 'ws-1',
        assignmentId: 'asg-1',
        status: WorkspaceStatus.ACTIVE,
      });

      const res = await service.createWorkspaceForAssignment('asg-1', 'user-1');

      expect(res.id).toBe('ws-1');
      expect(mockPrisma.researchWorkspace.create).toHaveBeenCalled();
      expect(mockPrisma.challengeAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ action: 'WORKSPACE_CREATED' }),
      });
    });
  });

  describe('getWorkspaceWithPermission (University Isolation)', () => {
    it('should throw ForbiddenException if user belongs to a different university', async () => {
      mockPrisma.researchWorkspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        assignment: { universityId: 'uni-A', challenge: { media: [], analyses: [] } },
        team: { members: [] },
        tasks: [], notes: [], evidence: [], references: [], findings: [], discussions: [],
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-B',
        organization: { university: { id: 'uni-B' } },
      });

      await expect(
        service.getWorkspaceWithPermission('ws-1', 'user-B', 'FACULTY'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should grant access if user belongs to the same university', async () => {
      const mockWs = {
        id: 'ws-1',
        assignment: { universityId: 'uni-A', challenge: { media: [], analyses: [] } },
        team: { members: [] },
        tasks: [], notes: [], evidence: [], references: [], findings: [], discussions: [],
      };
      mockPrisma.researchWorkspace.findUnique.mockResolvedValue(mockWs);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-A',
        organization: { university: { id: 'uni-A' } },
      });

      const res = await service.getWorkspaceWithPermission('ws-1', 'user-A', 'FACULTY');
      expect(res.id).toBe('ws-1');
    });
  });

  describe('addTeamMember (Same University Check)', () => {
    it('should throw ForbiddenException when adding user from a different university', async () => {
      mockPrisma.researchWorkspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        assignment: { universityId: 'uni-A', challenge: { media: [], analyses: [] } },
        team: { id: 'team-1', members: [] },
        tasks: [], notes: [], evidence: [], references: [], findings: [], discussions: [],
      });
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'lead-A', organization: { university: { id: 'uni-A' } } }) // requesting user
        .mockResolvedValueOnce({ id: 'target-B', organization: { university: { id: 'uni-B' } } }); // target user

      await expect(
        service.addTeamMember('ws-1', 'target-B', TeamRole.STUDENT, 'lead-A', 'FACULTY_LEAD'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markReadyForSolution', () => {
    it('should throw BadRequestException if no research notes exist', async () => {
      mockPrisma.researchWorkspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        status: WorkspaceStatus.ACTIVE,
        assignment: { universityId: 'uni-A', challengeId: 'ch-1', challenge: { media: [], analyses: [] } },
        team: { members: [] },
        tasks: [], notes: [], evidence: [{ id: 'ev-1' }], references: [], findings: [], discussions: [],
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'lead-A',
        organization: { university: { id: 'uni-A' } },
      });

      await expect(
        service.markReadyForSolution('ws-1', 'lead-A', 'FACULTY_LEAD'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update status to READY_FOR_SOLUTION if notes and evidence exist', async () => {
      mockPrisma.researchWorkspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        status: WorkspaceStatus.ACTIVE,
        assignment: { universityId: 'uni-A', challengeId: 'ch-1', challenge: { media: [], analyses: [] } },
        team: { members: [] },
        tasks: [], notes: [{ id: 'n-1' }], evidence: [{ id: 'ev-1' }], references: [], findings: [], discussions: [],
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'lead-A',
        organization: { university: { id: 'uni-A' } },
      });
      mockPrisma.researchWorkspace.update.mockResolvedValue({
        id: 'ws-1',
        status: WorkspaceStatus.READY_FOR_SOLUTION,
      });

      const res = await service.markReadyForSolution('ws-1', 'lead-A', 'FACULTY_LEAD');
      expect(res.status).toBe(WorkspaceStatus.READY_FOR_SOLUTION);
    });
  });
});
