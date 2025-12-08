import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class LmsOption extends Document {
  @Prop()
  lmsOptionId: string;

  @Prop()
  lmsOption: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  displayOrder: string;

  @Prop({ type: Boolean })
  validOption: boolean;

  @Prop()
  explanation: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LmsQuestion' })
  questionId: MongooseSchema.Types.ObjectId;

  @Prop()
  essayAnswer: string;
}

export const LmsOptionSchema = SchemaFactory.createForClass(LmsOption);

LmsOptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});