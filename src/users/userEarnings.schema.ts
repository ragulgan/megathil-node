import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'typeorm';
import * as mongoose from 'mongoose';


@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'userEarnings' })
export class UserEarnings {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  gemId: string

  @Prop()
  gemValue: number;

  @Prop()
  xpId: string

  @Prop()
  xpValue: number

  @Prop()
  megathilValue: number

  @Prop()
  trophyId: string

  @Prop()
  trophyName: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' })
  unitId: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Modules' })
  moduleId: string

  @Prop()
  action: string;

  @Prop()
  activity: string;

  @Prop()
  reason: string;

  @Prop()
  refNumber: string;

  @Prop({ enum: ['SPENT', 'EARNED', 'PURCHASED', 'AWARDED'] })
  earnedOrSpent: string
}

export const UserEarningsSchema = SchemaFactory.createForClass(UserEarnings);
UserEarningsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});