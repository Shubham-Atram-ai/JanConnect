import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsLatitude,
  IsLongitude,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateChallengeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  originalTranscript?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  normalizedText?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  problemType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  affectedPopulation?: string;

  // Location
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  block?: string;

  @IsOptional()
  @IsString()
  village?: string;
}
