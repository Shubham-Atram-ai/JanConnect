import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [DatabaseModule, MatchingModule],
  controllers: [AdminController],
})
export class AdminModule {}
