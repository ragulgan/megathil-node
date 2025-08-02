import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class StaffActivities {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Staff' })
  staffId: string;

  @Prop()
  action: string;

  @Prop()
  activity: string;

  @Prop()
  usefullId: string;

  @Prop()
  usefullIdFor: string;

  @Prop()
  reason: string;

}
export const StaffActivitiesSchema = SchemaFactory.createForClass(StaffActivities);
StaffActivitiesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});