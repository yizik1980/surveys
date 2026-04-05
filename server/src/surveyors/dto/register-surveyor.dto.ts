import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentDto {
  /** Last 4 digits of the card — full PAN must NOT be sent to the server */
  @IsNotEmpty()
  @IsNumberString()
  @Length(4, 4)
  cardLast4: string;

  @IsEnum(['visa', 'mastercard', 'amex', 'other'])
  cardType: 'visa' | 'mastercard' | 'amex' | 'other';

  @IsNotEmpty()
  @IsString()
  cardholderName: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(2, 2)
  expiryMonth: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(4, 4)
  expiryYear: string;
}

export class RegisterSurveyorSubscriptionDto {
  @IsEnum(['monthly', 'annual'])
  plan: 'monthly' | 'annual';
}

export class RegisterSurveyorDto {
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

  @ValidateNested()
  @Type(() => RegisterSurveyorSubscriptionDto)
  subscription: RegisterSurveyorSubscriptionDto;

  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;
}
