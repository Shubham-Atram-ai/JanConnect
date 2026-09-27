import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchingService } from './matching.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';

export interface AuthRequest extends ExpressRequest {
  user?: { id: string; email: string; role: string };
}

@Controller('challenges/:id/matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'CITIZEN') // Allow citizen to initiate matching, or admin
  async generateMatches(@Param('id') id: string) {
    return this.matchingService.generateMatches(id);
  }

  @Get()
  @Roles('PLATFORM_ADMIN', 'CITIZEN')
  async getMatches(@Param('id') id: string) {
    return this.matchingService.getMatches(id);
  }
}
