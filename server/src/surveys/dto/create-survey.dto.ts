import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SurveyStatus } from '../survey.schema';

export class CreateSurveyDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  questions?: any[];

  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['compact', 'focused'])
  displayMode?: 'compact' | 'focused';
}
