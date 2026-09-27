import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { ResearchWorkspaceController } from './research-workspace.controller';
import { ResearchWorkspaceService } from './research-workspace.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [UniversityController, ResearchWorkspaceController],
  providers: [ResearchWorkspaceService],
  exports: [ResearchWorkspaceService],
})
export class UniversityModule {}

