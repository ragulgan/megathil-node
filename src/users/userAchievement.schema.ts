import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class UserAchievement {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Achievement' })
  achievementId: string;

  @Prop()
  reason: string;

}
export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);
UserAchievementSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

