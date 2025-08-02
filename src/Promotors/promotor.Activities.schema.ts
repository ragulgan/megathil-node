import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class PromotorActivity {

  @Prop()
  activity: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PromoCode' })
  promotorId: string;

  @Prop()
  action: string;

  @Prop()
  reason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

}
export const PromotorActivitySchema = SchemaFactory.createForClass(PromotorActivity);
PromotorActivitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});