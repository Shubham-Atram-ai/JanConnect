import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';
import { ResearchWorkspaceService } from './research-workspace.service';
import { TeamRole, TaskStatus, TaskPriority, NoteType, FindingStatus } from '@prisma/client';

export interface AuthRequest extends ExpressRequest {
  user?: { id: string; email: string; role: string };
}

@Controller('university')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchWorkspaceController {
  constructor(private workspaceService: ResearchWorkspaceService) {}

  // ─── Workspaces ───────────────────────────────────────────────────────────────
  @Get('workspaces')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT', 'PLATFORM_ADMIN')
  async getWorkspaces(@Req() req: AuthRequest) {
    return this.workspaceService.getWorkspacesForUser(req.user!.id, req.user!.role);
  }

  @Post('assignments/:assignmentId/workspace')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY')
  async createWorkspace(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: { title?: string; description?: string },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createWorkspaceForAssignment(
      assignmentId,
      req.user!.id,
      dto.title,
      dto.description,
    );
  }

  @Get('workspaces/:id')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT', 'PLATFORM_ADMIN')
  async getWorkspaceDetail(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.workspaceService.getWorkspaceWithPermission(id, req.user!.id, req.user!.role);
  }

  @Post('workspaces/:id/ready-for-solution')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY')
  async markReadyForSolution(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.workspaceService.markReadyForSolution(id, req.user!.id, req.user!.role);
  }

  // ─── Team Management ──────────────────────────────────────────────────────────
  @Get('workspaces/:id/eligible-members')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY')
  async getEligibleMembers(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.workspaceService.getEligibleUniversityMembers(id, req.user!.id, req.user!.role);
  }

  @Post('workspaces/:id/team/members')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY')
  async addTeamMember(
    @Param('id') id: string,
    @Body() dto: { userId: string; role: TeamRole },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.addTeamMember(id, dto.userId, dto.role, req.user!.id, req.user!.role);
  }

  @Delete('workspaces/:id/team/members/:userId')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY')
  async removeTeamMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.removeTeamMember(id, targetUserId, req.user!.id, req.user!.role);
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────────
  @Post('workspaces/:id/tasks')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async createTask(
    @Param('id') id: string,
    @Body() dto: { title: string; description?: string; assignedTo?: string; priority?: TaskPriority; dueDate?: Date },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createTask(id, dto, req.user!.id, req.user!.role);
  }

  @Patch('workspaces/:id/tasks/:taskId')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: { title?: string; description?: string; assignedTo?: string; status?: TaskStatus; priority?: TaskPriority },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.updateTask(id, taskId, dto, req.user!.id, req.user!.role);
  }

  // ─── Notes ────────────────────────────────────────────────────────────────────
  @Post('workspaces/:id/notes')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async createNote(
    @Param('id') id: string,
    @Body() dto: { title: string; content: string; noteType?: NoteType },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createNote(id, dto, req.user!.id, req.user!.role);
  }

  @Patch('workspaces/:id/notes/:noteId')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async updateNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() dto: { title?: string; content?: string; noteType?: NoteType },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.updateNote(id, noteId, dto, req.user!.id, req.user!.role);
  }

  // ─── Evidence & References ─────────────────────────────────────────────────────
  @Post('workspaces/:id/evidence')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async createEvidence(
    @Param('id') id: string,
    @Body() dto: { title: string; description?: string; type?: string; storageKey: string; mimeType: string; fileSize: number },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createEvidence(id, dto, req.user!.id, req.user!.role);
  }

  @Post('workspaces/:id/references')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async createReference(
    @Param('id') id: string,
    @Body() dto: { title: string; url?: string; citation?: string; description?: string },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createReference(id, dto, req.user!.id, req.user!.role);
  }

  // ─── Findings & Discussions ────────────────────────────────────────────────────
  @Post('workspaces/:id/findings')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER')
  async createFinding(
    @Param('id') id: string,
    @Body() dto: { title: string; description: string; evidenceIds?: string[]; status?: FindingStatus },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createFinding(id, dto, req.user!.id, req.user!.role);
  }

  @Patch('workspaces/:id/findings/:findingId')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER')
  async updateFinding(
    @Param('id') id: string,
    @Param('findingId') findingId: string,
    @Body() dto: { title?: string; description?: string; status?: FindingStatus },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.updateFinding(id, findingId, dto, req.user!.id, req.user!.role);
  }

  @Post('workspaces/:id/discussions')
  @Roles('UNIVERSITY_ADMIN', 'FACULTY', 'RESEARCHER', 'STUDENT')
  async createDiscussion(
    @Param('id') id: string,
    @Body() dto: { content: string; parentId?: string },
    @Req() req: AuthRequest,
  ) {
    return this.workspaceService.createDiscussion(id, dto, req.user!.id, req.user!.role);
  }
}
