import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SurveyDocument = Survey & Document;

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  RATING = 'rating',
  DATE = 'date',
}

export enum SurveyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Schema({ _id: false })
class Question {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ default: false })
  required: boolean;

  @Prop()
  placeholder?: string;

  @Prop()
  minRating?: number;

  @Prop()
  maxRating?: number;
}

@Schema({ _id: false })
class AssignedUser {
  @Prop()
  userId?: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  token: string;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  respondedAt?: Date;

  @Prop({ default: 'pending', enum: ['pending', 'sent', 'responded'] })
  status: string;
}

@Schema({ timestamps: true })
export class Survey {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: Types.ObjectId;

  @Prop({ type: [Question], default: [] })
  questions: Question[];

  @Prop({ type: [AssignedUser], default: [] })
  assignedUsers: AssignedUser[];

  @Prop({ type: String, enum: SurveyStatus, default: SurveyStatus.DRAFT })
  status: SurveyStatus;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop()
  category?: string;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);
