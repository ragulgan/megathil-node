import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class UserBookings extends mongoose.Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'InterviewerAvailabilities' })
  availabilityId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop()
  startDateTime: Date;

  @Prop()
  endDateTime: Date;

  @Prop()
  meetingLink: string;

  @Prop()
  interviewNote: string;

  @Prop()
  interviewerRejectReason: string;

  @Prop()
  interviewerCancelReason: string;

  @Prop()
  userCancelReason: string;

  @Prop()
  rescheduledCount: number;

  // columns for interview results
  @Prop()
  fluency: number;

  @Prop({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' })
  engery: string;

  @Prop()
  speechRate: number;

  @Prop()
  vocabulary: number;

  @Prop()
  contentRelevance: number;

  @Prop()
  interviewerComments: string;

  @Prop({ enum: ['PENDING', 'RESCHEDULED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED_BY_INTERVIEWER', 'CANCELED_BY_USER', 'NOT_HAPPENED', 'DELETED'], default: 'PENDING' })
  status: string;

}

export const UserBookingsSchema = SchemaFactory.createForClass(UserBookings);
UserBookingsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});