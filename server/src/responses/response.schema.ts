import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResponseDocument = SurveyResponse & Document;

@Schema({ _id: false })
class Answer {
  @Prop({ required: true })
  questionId: string;

  @Prop({ type: Object })
  value: any;
}

@Schema({ timestamps: true })
export class SurveyResponse {
  @Prop({ type: Types.ObjectId, ref: 'Survey', required: true })
  survey: Types.ObjectId;

  @Prop()
  respondentEmail: string;

  @Prop()
  respondentName?: string;

  @Prop()
  token: string;

  @Prop({ type: [Answer], default: [] })
  answers: Answer[];

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(SurveyResponse);
