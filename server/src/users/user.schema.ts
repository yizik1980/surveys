import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  SURVEYOR = 'surveyor',
  SURVEYED = 'surveyed',
}

@Schema({ timestamps: true })
export class User {
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

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'ישראל' },
    },
  })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({ type: String, enum: UserRole, default: UserRole.SURVEYED })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  companyName?: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  notes?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
