import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CertificateAttributes extends Document {
  @Prop({ type: String, required: true })
  certificateId: string;

  @Prop({ type: String, required: true })
  diceDisplayName: string;

  @Prop({ type: String, required: true })
  validTill: string;

  @Prop({ type: String, required: true })
  skillName: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  issuedOn: string;

  @Prop({ type: String, required: true })
  score: string;

  @Prop({ type: String, required: true })
  certLevel: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  issuedBy: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  phone: string;
}

export const CertificateAttributesSchema = SchemaFactory.createForClass(CertificateAttributes);
