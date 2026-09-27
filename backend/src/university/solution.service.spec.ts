import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SolutionService } from './solution.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SolutionService', () => {
  let service: SolutionService;
  let prisma: any;
  let notifications: any;

  beforeEach(async () => {
    prisma = {
      researchWorkspace: {
        findUnique: jest.fn(),
      },
      solution: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
      challenge: {
        findUnique: jest.fn(),
      },
      researchTeamMember: {
        findFirst: jest.fn(),
      },
      challengeAuditLog: {
        create: jest.fn(),
      }
    };

    notifications = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolutionService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<SolutionService>(SolutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdateDraft', () => {
    it('should throw ForbiddenException if workspace not ready for solution', async () => {
      prisma.researchWorkspace.findUnique.mockResolvedValue({
        id: 'ws-1', assignment: { universityId: 'uni-1', status: 'ACCEPTED' }, status: 'ACTIVE'
      });

      await expect(service.createOrUpdateDraft('assign-1', 'uni-1', {}, 'user-1'))
        .rejects.toThrow();
    });

    it('should create draft if not exists', async () => {
      prisma.researchWorkspace.findUnique.mockResolvedValue({
        id: 'ws-1', assignment: { universityId: 'uni-1', status: 'ACCEPTED', challengeId: 'chal-1' }, status: 'READY_FOR_SOLUTION'
      });
      prisma.researchTeamMember.findFirst.mockResolvedValue({ role: 'FACULTY' });
      prisma.solution.findUnique.mockResolvedValue(null);
      prisma.solution.create.mockResolvedValue({ id: 'sol-1', status: 'DRAFT' });

      const result = await service.createOrUpdateDraft('assign-1', 'uni-1', { title: 'Test' }, 'user-1');
      expect(result.id).toEqual('sol-1');
      expect(prisma.solution.create).toHaveBeenCalled();
    });
  });

  describe('submitSolution', () => {
    it('should submit solution and trigger notifications', async () => {
      prisma.solution.findUnique.mockResolvedValue({
        id: 'sol-1',
        workspace: {
          assignment: { universityId: 'uni-1', challengeId: 'chal-1' },
          findings: [{ id: 'f-1', status: 'CONFIRMED' }],
          evidence: [],
          references: [],
        },
        title: 'Title',
        summary: 'Sum',
        problemStatement: 'Prob',
        proposedApproach: 'Appr',
        methodology: 'Meth',
        implementationPlan: 'Plan',
        status: 'DRAFT'
      });

      prisma.solution.update.mockResolvedValue({ id: 'sol-1', status: 'SUBMITTED' });
      prisma.user.findMany.mockResolvedValue([{ id: 'admin-1' }]);
      prisma.challenge.findUnique.mockResolvedValue({ id: 'chal-1', citizenId: 'cit-1' });
      prisma.researchTeamMember.findFirst.mockResolvedValue({ role: 'FACULTY_LEAD' });

      const result = await service.submitSolution('assign-1', 'uni-1', 'user-1');
      
      expect(result.status).toEqual('SUBMITTED');
      expect(prisma.solution.update).toHaveBeenCalled();
      expect(notifications.create).toHaveBeenCalledTimes(2);
    });
  });
});
