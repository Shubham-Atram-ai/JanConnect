import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { ResearchWorkspaceController } from './research-workspace.controller';
import { ResearchWorkspaceService } from './research-workspace.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SolutionController } from './solution.controller';
import { SolutionService } from './solution.service';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [UniversityController, ResearchWorkspaceController, SolutionController],
  providers: [ResearchWorkspaceService, SolutionService],
  exports: [ResearchWorkspaceService, SolutionService],
})
export class UniversityModule {}

