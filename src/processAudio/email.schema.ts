import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Email extends Document {
  @Prop({ type: String, required: true })
  inviteeEmail: string;

  @Prop({ type: String, required: true })
  emailTemplateId: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
