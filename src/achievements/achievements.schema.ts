import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Achievements extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  keyName: string;

  @Prop({})
  shortNote: string;

  @Prop({ required: true, type: Number, default: 0 })
  gemValue: number;

  @Prop({ required: true, type: Number, default: 0 })
  xpValue: number;

  @Prop({ required: true, type: Number, default: 0 })
  megathilPoints: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Badges' })
  badge: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;
}

export const AchievementsSchema = SchemaFactory.createForClass(Achievements);
AchievementsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});