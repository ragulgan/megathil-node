import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class ContactUs {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    required: true,
    enum: ['UNREAD', 'READ', 'DELETED'],
    default: 'UNREAD'
  })
  status: string;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);

ContactUsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});