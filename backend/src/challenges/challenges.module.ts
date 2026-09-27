import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController, CitizenSolutionsController } from './challenges.controller';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, AiModule, StorageModule, AuditModule, NotificationsModule],
  providers: [ChallengesService],
  controllers: [ChallengesController, CitizenSolutionsController],
})
export class ChallengesModule {}
