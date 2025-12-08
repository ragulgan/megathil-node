import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class LmsQuestion extends Document {
  @Prop()
  questionlId: string;

  @Prop({ required: true })
  lmsQuestion: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  displayOrder: string;

  @Prop()
  questionTiming: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topics' })
  topicId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubTopics' })
  subTopicId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubTopics1' })
  subTopic1Id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LmsTest' })
  testLevelId: MongooseSchema.Types.ObjectId;

  @Prop()
  mcqImageUrl: string;

  @Prop()
  mcqProgramming: string;
}

export const LmsQuestionSchema = SchemaFactory.createForClass(LmsQuestion);

LmsQuestionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});