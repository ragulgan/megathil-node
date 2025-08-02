import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { NotificationStatus } from '../libs/constants';
@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Notification {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({type: String, enum: NotificationStatus, default: NotificationStatus.UNREAD })
  viewed: NotificationStatus;

}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});