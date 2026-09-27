import { Controller, Get, Param, Post, Patch, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SolutionService } from './solution.service';
import { PrismaService } from '../database/prisma.service';

@Controller('university')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolutionController {
  constructor(
    private solutionService: SolutionService,
    private prisma: PrismaService
  ) {}

  private async getUniversityId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { include: { university: true } } }
    });
    const uniId = user?.organization?.university?.id;
    if (!uniId) throw new ForbiddenException('User is not associated with a University');
    return uniId;
  }

  @Post('assignments/:assignmentId/solution')
  @Roles('FACULTY', 'RESEARCHER', 'UNIVERSITY_ADMIN')
  async createOrUpdateDraft(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    const uniId = await this.getUniversityId(req.user.id);
    return this.solutionService.createOrUpdateDraft(assignmentId, uniId, dto, req.user.id);
  }

  @Get('assignments/:assignmentId/solution')
  @Roles('FACULTY', 'RESEARCHER', 'STUDENT', 'UNIVERSITY_ADMIN')
  async getSolutionDraft(
    @Param('assignmentId') assignmentId: string,
    @Req() req: any
  ) {
    const uniId = await this.getUniversityId(req.user.id);
    return this.solutionService.getSolution(assignmentId, uniId);
  }

  @Post('solutions/:id/submit')
  @Roles('FACULTY', 'UNIVERSITY_ADMIN')
  async submitSolution(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const uniId = await this.getUniversityId(req.user.id);
    const solution = await this.prisma.solution.findUnique({ where: { id } });
    if (!solution) throw new ForbiddenException('Solution not found');
    return this.solutionService.submitSolution(solution.assignmentId, uniId, req.user.id);
  }

  @Get('solutions')
  @Roles('FACULTY', 'RESEARCHER', 'STUDENT', 'UNIVERSITY_ADMIN')
  async getSolutions(@Req() req: any) {
    const uniId = await this.getUniversityId(req.user.id);
    return this.solutionService.getUniversitySolutions(uniId);
  }

  @Get('solutions/:id')
  @Roles('FACULTY', 'RESEARCHER', 'STUDENT', 'UNIVERSITY_ADMIN')
  async getSolutionDetail(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const uniId = await this.getUniversityId(req.user.id);
    return this.solutionService.getUniversitySolutionById(id, uniId);
  }
}
