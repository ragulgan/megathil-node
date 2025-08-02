import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class InterviewerAvailabilities extends mongoose.Document {

  @Prop({ required: true })
  scheduleName: string;

  @Prop({ enum: ['WEEKLY', 'MONTHLY', 'NONE'], default: 'NONE' })
  frequency: string;

  @Prop()
  frequencyId: string;

  @Prop({ type: [Number] })
  weeksOfMonth: number[];

  @Prop()
  slotDuration: number;

  @Prop({ type: [Object] })
  slots: any[];

  @Prop()
  startDateTime: Date;

  @Prop()
  endDateTime: Date;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Interviewer' })
  interviewer: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  admin: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['AVAILABILITY', 'LEAVE', 'HOLIDAY'], default: 'AVAILABILITY' })
  type: string;

  @Prop({ enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const InterviewerAvailabilitiesSchema = SchemaFactory.createForClass(InterviewerAvailabilities);
InterviewerAvailabilitiesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});