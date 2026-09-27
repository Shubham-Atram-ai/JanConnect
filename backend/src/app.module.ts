import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChallengesModule } from './challenges/challenges.module';
import { AiModule } from './ai/ai.module';
import { StorageModule } from './storage/storage.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MatchingModule } from './matching/matching.module';
import { AdminModule } from './admin/admin.module';
import { UniversityModule } from './university/university.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    ChallengesModule,
    AiModule,
    StorageModule,
    AuditModule,
    NotificationsModule,
    MatchingModule,
    AdminModule,
    UniversityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
