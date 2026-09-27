import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { AnalyzeChallengeDto } from './dto/analyze-challenge.dto';

interface AuthRequest extends ExpressRequest {
  user: { id: string; email: string; role: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CITIZEN)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly svc: ChallengesService) {}

  // POST /api/v1/challenges
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthRequest, @Body() dto: CreateChallengeDto) {
    return this.svc.create(req.user.id, dto);
  }

  // GET /api/v1/challenges
  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.svc.findAll(req.user.id);
  }

  // GET /api/v1/challenges/:id
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.findOne(id, req.user.id);
  }

  // PATCH /api/v1/challenges/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateChallengeDto,
  ) {
    return this.svc.update(id, req.user.id, dto);
  }

  // POST /api/v1/challenges/:id/analyze
  @Post(':id/analyze')
  @HttpCode(HttpStatus.OK)
  async analyze(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: AnalyzeChallengeDto,
  ) {
    const challenge = await this.svc.findOne(id, req.user.id);
    const text = challenge.normalizedText || challenge.originalTranscript || '';
    const language = dto.language || challenge.originalLanguage || 'en';
    return this.svc.analyzeText(id, req.user.id, text, language);
  }

  // POST /api/v1/challenges/:id/voice
  @Post(':id/voice')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  @HttpCode(HttpStatus.OK)
  async uploadVoice(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AnalyzeChallengeDto,
  ) {
    return this.svc.analyzeVoice(id, req.user.id, file, dto.language);
  }

  // POST /api/v1/challenges/:id/media
  @Post(':id/media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  uploadMedia(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.uploadMedia(id, req.user.id, file);
  }

  // POST /api/v1/challenges/:id/submit
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.submit(id, req.user.id);
  }

  // GET /api/v1/challenges/:id/solutions
  @Get(':id/solutions')
  getSolutions(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.getSolutionsForChallenge(id, req.user.id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CITIZEN)
@Controller('solutions')
export class CitizenSolutionsController {
  constructor(private readonly svc: ChallengesService) {}

  @Get(':id')
  getSolutionById(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.getSolutionById(id, req.user.id);
  }
}

