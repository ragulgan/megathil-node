import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class AdminActivity {

  @Prop()
  activity: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  adminId: string;

  @Prop()
  action: string;

  @Prop()
  reason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Staff' })
  staffId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Interviewer' })
  interviewerId: string;

  @Prop()
  usefullIdFor: string;

}
export const AdminActivitySchema = SchemaFactory.createForClass(AdminActivity);
AdminActivitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});