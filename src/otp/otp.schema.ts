import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Otp {
  @Prop({
    type: String,
    required: false
  })
  email: string;

  @Prop({ required: false })
  mobileCode: string;
  
  @Prop({
    type: String,
    required: false
  })
  mobileNumber: string;

  @Prop({
    type: String,
    required: true
  })
  otp: string;

  @Prop()
  type: string;

  @Prop({
    type: String,
    required: false
  })
  deviceId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['PENDING', 'VERIFIED', 'EXPIRED'],
    default: 'PENDING'
  })
  status: string;

  @Prop({ type: Object })
  smsResponse: any;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.set('toJSON', {
  transform: (ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});