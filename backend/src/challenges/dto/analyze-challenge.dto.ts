import { IsString, IsOptional } from 'class-validator';

export class AnalyzeChallengeDto {
  @IsOptional()
  @IsString()
  language?: string;
}

export class VoiceChallengeDto {
  @IsOptional()
  @IsString()
  audioKey?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
