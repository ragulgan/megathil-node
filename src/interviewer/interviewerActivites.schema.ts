import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class InterviewerActivity {

  @Prop()
  activity: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Interviewer' })
  interviewerId: string;

  @Prop()
  shortDescription: string;

  @Prop()
  action: string;

}
export const InterviewerActivitySchema = SchemaFactory.createForClass(InterviewerActivity);
InterviewerActivitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});