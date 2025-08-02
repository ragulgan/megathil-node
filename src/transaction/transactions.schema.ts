import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Transaction extends mongoose.Document {

  @Prop()
  item: string;

  @Prop()
  quantity: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  refNumber: string;

  @Prop()
  payment: string;

  @Prop()
  reason: string;

  @Prop({ type: Object })
  paymentResponse: any;

  @Prop({ enum: ['SUCCESS', 'FAILED', 'CANCELLED', 'PENDING'], default: 'PENDING' })
  status: string;

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});