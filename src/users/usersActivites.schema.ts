import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class UserActivity {

  @Prop()
  activity: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Modules' })
  moduleId: string;

  @Prop()
  shortDescription: string;

  @Prop()
  action: string;

}
export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
UserActivitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});