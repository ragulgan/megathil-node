import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  COMPLETED = 'COMPLETED',
  INCOMPLETED = 'INCOMPLETED'
}


@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class LmsProgressStatus extends Document {
  @Prop()
  totalQuestion: string;

  @Prop()
  correctQuestionCount: string;

  @Prop()
  wrongQuestionCount: string;

  @Prop()
  testTimingTaken: string;

  @Prop({ type: String })
  testPercertage: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Topics' })
  topicId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubTopics' })
  subTopicId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubTopics1' })
  subTopic1Id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LmsTest' })
  testLevelId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ enum: Status, default: Status.INCOMPLETED })
  status: string;
}

export const LmsProgressStatusSchema = SchemaFactory.createForClass(LmsProgressStatus);

LmsProgressStatusSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});