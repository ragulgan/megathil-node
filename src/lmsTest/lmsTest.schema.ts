import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum QuestionType {
  MCQ = 'MCQ',
  MCQIMAGE = 'MCQIMAGE',
  MCQPROGRAMMING = 'MCQPROGRAMMING',
  ESSAY = 'ESSAY'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class LmsTest extends Document {
  @Prop()
  testLevelId: string;

  @Prop({ required: true })
  testLevel: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  displayOrder: string;

  @Prop()
  description: string;

  @Prop()
  testTiming: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topics' })
  topicId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubTopics' })
  subTopicId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubTopics1' })
  subTopic1Id: MongooseSchema.Types.ObjectId;

  @Prop({ enum: QuestionType, required: true })
  lmsQuestionType: string;
}

export const LmsTestSchema = SchemaFactory.createForClass(LmsTest);

LmsTestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});