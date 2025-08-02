import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class UserScoreHistories {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Modules' })
  moduleId: MongooseSchema.Types.ObjectId;

  @Prop()
  gems: number;

  @Prop()
  xp: number;

  @Prop()
  moduleMVP: number;

  @Prop()
  scoredMVP: number;

  @Prop()
  penalities: [{ reason: string, penality: number }]

  @Prop()
  comments: string;

}
export const UserScoreHistoriesSchema = SchemaFactory.createForClass(UserScoreHistories);
UserScoreHistoriesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});