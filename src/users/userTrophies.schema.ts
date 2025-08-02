import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class UserTrophies {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trophies' })
  trophyId: string;

  @Prop()
  reason: string;

}
export const UserTrophiesSchema = SchemaFactory.createForClass(UserTrophies);
UserTrophiesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});