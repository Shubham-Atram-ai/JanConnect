import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignmentStatus, ChallengeStatus } from '@prisma/client';

describe('MatchingService', () => {
  let service: MatchingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: PrismaService,
          useValue: {
            challenge: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            university: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            universityAssignment: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            challengeAuditLog: {
              create: jest.fn(),
            },
            user: {
               findMany: jest.fn().mockResolvedValue([]),
            },
            $transaction: jest.fn(async (cb) => {
               // Mock the transaction execution
               return cb({
                 universityAssignment: {
                   findUnique: jest.fn(),
                   update: jest.fn(),
                 },
                 university: {
                   update: jest.fn(),
                 },
                 challengeAuditLog: {
                   create: jest.fn(),
                 },
                 user: {
                   findMany: jest.fn().mockResolvedValue([]),
                 },
                 challenge: {
                   update: jest.fn(),
                 }
               });
            }),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should generate matches for a valid challenge', async () => {
    // Mock challenge
    (prisma.challenge.findUnique as jest.Mock).mockResolvedValue({
      id: 'challenge-1',
      status: ChallengeStatus.SUBMITTED,
      domain: 'Agriculture',
      requiredSkills: ['Soil Science'],
    });

    // Mock universities
    (prisma.university.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'uni-1',
        strengthDomains: ['Agriculture'],
        faculties: [{ domains: ['Agriculture'], researchAreas: ['Soil Science'], skills: ['Soil Science'] }],
        facilities: [],
        projects: [],
      },
    ]);

    const result = await service.generateMatches('challenge-1');
    expect(result.length).toBe(1);
    expect(result[0].universityId).toBe('uni-1');
    expect(prisma.universityAssignment.upsert).toHaveBeenCalled();
  });

  it('should enforce max 5 limit on distribution', async () => {
    // Mock a challenge that already has 2 assignments active
    (prisma.challenge.findUnique as jest.Mock).mockResolvedValue({
      id: 'challenge-1',
      status: ChallengeStatus.MATCHED,
      assignments: [
         { status: AssignmentStatus.SENT },
         { status: AssignmentStatus.ACCEPTED }
      ]
    });

    const uniIds = ['uni-2', 'uni-3', 'uni-4', 'uni-5']; // 4 more would exceed 5 (2+4 = 6)
    
    await expect(service.distributeAssignments('challenge-1', uniIds, 'admin-1'))
      .rejects
      .toThrow('Cannot distribute to 4 more universities. Currently active: 2. Limit is 5.');
  });
});
