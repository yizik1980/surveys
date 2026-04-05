import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SurveyorDocument = Surveyor & Document;

@Schema({ _id: false })
class Subscription {
  @Prop({ type: String, enum: ['monthly', 'annual'], required: true })
  plan: 'monthly' | 'annual';

  @Prop({
    type: String,
    enum: ['trial', 'active', 'inactive', 'cancelled'],
    default: 'trial',
  })
  status: 'trial' | 'active' | 'inactive' | 'cancelled';

  @Prop({ default: 0 })
  pricePerMonth: number;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;
}

// Stores only masked / non-sensitive payment metadata.
// Raw card numbers are NEVER persisted.
@Schema({ _id: false })
class Payment {
  @Prop({ required: true })
  cardLast4: string;

  @Prop({ type: String, enum: ['visa', 'mastercard', 'amex', 'other'], default: 'other' })
  cardType: 'visa' | 'mastercard' | 'amex' | 'other';

  @Prop({ required: true })
  cardholderName: string;

  @Prop({ required: true })
  expiryMonth: string;

  @Prop({ required: true })
  expiryYear: string;
}

@Schema({ timestamps: true })
export class Surveyor {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  companyName?: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Subscription })
  subscription?: Subscription;

  @Prop({ type: Payment })
  payment?: Payment;
}

export const SurveyorSchema = SchemaFactory.createForClass(Surveyor);
