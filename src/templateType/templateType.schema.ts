import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class TemplateType {

  @Prop({ required: true, unique: true })
  displayName: string;

  @Prop({ required: true, unique: true })
  displayValue: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;
}

export const TemplateTypeSchema = SchemaFactory.createForClass(TemplateType);

TemplateTypeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
