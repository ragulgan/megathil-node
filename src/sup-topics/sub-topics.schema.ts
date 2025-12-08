import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class SubTopics extends Document {
  @Prop()
  subTopicId: string;

  @Prop()
  subTopicName: string;

  @Prop()
  imageUrl: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  displayOrder: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topics' })
  topicId: MongooseSchema.Types.ObjectId;
}

export const SubTopicSchema = SchemaFactory.createForClass(SubTopics);

SubTopicSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});