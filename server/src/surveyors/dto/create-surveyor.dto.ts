import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubscriptionDto {
  @IsEnum(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @IsOptional()
  @IsEnum(['trial', 'active', 'inactive', 'cancelled'])
  status?: 'trial' | 'active' | 'inactive' | 'cancelled';

  @IsOptional()
  @IsNumber()
  pricePerMonth?: number;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;
}

export class CreateSurveyorDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionDto)
  subscription?: SubscriptionDto;
}
