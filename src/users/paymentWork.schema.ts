import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class PaymentWorkTable extends mongoose.Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: Object })
  paymentData: any;

  @Prop({ enum: ['COMPLETED', 'PENDING', 'FAILED', 'SKIPPED', 'PROCESSING'], default: 'PENDING' })
  status: string;

  @Prop()
  message: string;
}

export const PaymentWorkTableSchema = SchemaFactory.createForClass(PaymentWorkTable);
PaymentWorkTableSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});