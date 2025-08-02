import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class PromoCode {

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ unique: true, sparse: true, trim: true })
  email: string;

  @Prop({ unique: true, sparse: true, trim: true })
  mobileNumber: string;

  @Prop({ required: true, unique: true, sparse: true, trim: true })
  promotedCode: string;

  @Prop({ enum: ['PROMOTOR'], default: 'PROMOTOR' })
  role: string;

  @Prop({trim: true})
  password: string;

  @Prop({ trim: true })
  profileImage: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE'
  })
  status: string;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);

PromoCodeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});