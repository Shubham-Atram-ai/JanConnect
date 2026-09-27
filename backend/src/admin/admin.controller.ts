import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../database/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { Request as ExpressRequest } from 'express';

export interface AuthRequest extends ExpressRequest {
  user?: { id: string; email: string; role: string };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private matching: MatchingService
  ) {}

  @Get('challenges')
  @Roles('PLATFORM_ADMIN')
  async getChallenges() {
    return this.prisma.challenge.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { createdAt: 'desc' },
      include: {
        citizen: { select: { email: true } },
        assignments: true,
      }
    });
  }

  @Get('challenges/:id')
  @Roles('PLATFORM_ADMIN')
  async getChallenge(@Param('id') id: string) {
    return this.prisma.challenge.findUnique({
      where: { id },
      include: {
        citizen: { select: { email: true } },
        assignments: {
          include: {
            university: { include: { organization: true } }
          }
        },
        analyses: true,
      }
    });
  }

  @Get('universities')
  @Roles('PLATFORM_ADMIN')
  async getUniversities() {
    return this.prisma.university.findMany({
      include: { organization: true, departments: true }
    });
  }

  @Post('challenges/:id/distribute')
  @Roles('PLATFORM_ADMIN')
  async distributeChallenge(
    @Param('id') id: string,
    @Body() dto: { universityIds: string[] },
    @Req() req: AuthRequest
  ) {
    return this.matching.distributeAssignments(id, dto.universityIds, req.user!.id);
  }

  @Get('solutions')
  @Roles('PLATFORM_ADMIN')
  async getSolutions() {
    return this.prisma.solution.findMany({
      where: { status: 'SUBMITTED' },
      include: {
        workspace: {
          include: {
            assignment: {
              include: {
                challenge: true,
                university: { include: { organization: true } },
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  @Get('solutions/:id')
  @Roles('PLATFORM_ADMIN')
  async getSolutionDetail(@Param('id') id: string) {
    return this.prisma.solution.findUnique({
      where: { id, status: 'SUBMITTED' },
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
  }
}

