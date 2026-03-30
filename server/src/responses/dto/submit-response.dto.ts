import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SubmitResponseDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsArray()
  answers: Array<{
    questionId: string;
    value: any;
  }>;
}
