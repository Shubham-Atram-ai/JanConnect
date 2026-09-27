import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  providers: [MatchingService],
  controllers: [MatchingController],
  exports: [MatchingService], // Exported for AdminModule
})
export class MatchingModule {}
