import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class LmsUserHistory extends Document {
  @Prop({ type: Boolean })
  questionResponse: boolean;

  @Prop()
  questionTimingTaken: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LmsProgressStatus' })
  lmsProgressId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LmsQuestion' })
  questionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'LmsOption' })
  optionId: MongooseSchema.Types.ObjectId;

  @Prop()
  workSpace: string;

  @Prop()
  essayScore: string;
}

export const LmsUserHistorySchema = SchemaFactory.createForClass(LmsUserHistory);

LmsUserHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});