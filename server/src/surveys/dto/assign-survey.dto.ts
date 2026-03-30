import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignSurveyDto {
  @IsArray()
  @IsNotEmpty()
  recipients: Array<{
    email: string;
    name?: string;
    userId?: string;
  }>;
}
