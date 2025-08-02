import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Certificate extends Document {

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  certificateId: string;

  @Prop({ type: String, required: true })
  validTill: string;

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
  phone: string;

  @Prop({ type: Boolean, required: true })
  is_cert_required: boolean;

  @Prop({ type: String, required: true })
  schema_name: string;

  @Prop({ type: String, required: true })
  schema_version: string;

  @Prop({ type: [String], required: true })
  invite_modes: string[];

  @Prop({ type: String, required: true })
  invitee_name: string;

  @Prop({
    type: {
      invitee_email: { type: String, required: true },
      email_template_id: { type: String, required: true },
    },
    required: true
  })
  email: {
    invitee_email: string;
    email_template_id: string;
  };

  @Prop({
    type: {
      diceDisplayName: { type: String, required: true },
      skillName: { type: String, required: true },
    },
    required: true
  })
  attributes: {
    diceDisplayName: string;
    skillName: string;
  };

  @Prop({ type: String })
  template_id?: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
