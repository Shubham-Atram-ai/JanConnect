import { Controller, Get, Param, Post, Body, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';

export interface AuthRequest extends ExpressRequest {
  user?: { id: string; email: string; role: string };
}
import { PrismaService } from '../database/prisma.service';
import { AssignmentStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('university/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UniversityController {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  @Get()
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async getAssignments(@Req() req: AuthRequest) {
    const user = await this.prisma.user.findUnique({
       where: { id: req.user!.id },
       include: { organization: { include: { university: true } } }
    });

    const uniId = user?.organization?.university?.id;
    if (!uniId) throw new ForbiddenException('User is not associated with a University');

    return this.prisma.universityAssignment.findMany({
      where: {
        universityId: uniId,
        status: { notIn: [AssignmentStatus.RECOMMENDED] } // Only show SENT or later
      },
      include: {
        challenge: {
           include: { media: true }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });
  }

  @Get(':id')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async getAssignmentDetail(@Param('id') id: string, @Req() req: AuthRequest) {
    const user = await this.prisma.user.findUnique({
       where: { id: req.user!.id },
       include: { organization: { include: { university: true } } }
    });
    const uniId = user?.organization?.university?.id;

    const assignment = await this.prisma.universityAssignment.findUnique({
      where: { id },
      include: {
        challenge: { include: { media: true, analyses: true } }
      }
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.universityId !== uniId) throw new ForbiddenException('Cannot access assignment belonging to another university');

    // Update to VIEWED if it's SENT
    if (assignment.status === AssignmentStatus.SENT) {
      await this.prisma.universityAssignment.update({
        where: { id },
        data: { status: AssignmentStatus.VIEWED, viewedAt: new Date() }
      });
    }

    return assignment;
  }

  @Post(':id/accept')
  @Roles('UNIVERSITY_ADMIN')
  async acceptAssignment(@Param('id') id: string, @Req() req: AuthRequest) {
    const user = await this.prisma.user.findUnique({
       where: { id: req.user!.id },
       include: { organization: { include: { university: true } } }
    });
    const uniId = user?.organization?.university?.id;

    const assignment = await this.prisma.universityAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.universityId !== uniId) throw new ForbiddenException('Unauthorized');

    const updated = await this.prisma.universityAssignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.ACCEPTED,
        respondedAt: new Date(),
      }
    });

    await this.prisma.challengeAuditLog.create({
      data: {
        challengeId: assignment.challengeId,
        actorId: req.user!.id,
        action: 'ASSIGNMENT_ACCEPTED',
        metadata: { universityId: uniId }
      }
    });

    return updated;
  }

  @Post(':id/decline')
  @Roles('UNIVERSITY_ADMIN')
  async declineAssignment(
    @Param('id') id: string,
    @Body() dto: { reason: string },
    @Req() req: AuthRequest
  ) {
    const user = await this.prisma.user.findUnique({
       where: { id: req.user!.id },
       include: { organization: { include: { university: true } } }
    });
    const uniId = user?.organization?.university?.id;

    const assignment = await this.prisma.universityAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.universityId !== uniId) throw new ForbiddenException('Unauthorized');

    const updated = await this.prisma.universityAssignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.DECLINED,
        declineReason: dto.reason,
        respondedAt: new Date(),
      }
    });

    await this.prisma.university.update({
       where: { id: uniId },
       data: { activeAssignments: { decrement: 1 } } // Free up capacity
    });

    await this.prisma.challengeAuditLog.create({
      data: {
        challengeId: assignment.challengeId,
        actorId: req.user!.id,
        action: 'ASSIGNMENT_DECLINED',
        metadata: { universityId: uniId, reason: dto.reason }
      }
    });

    return updated;
  }
}
