import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Entity } from 'typeorm';

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'loginhistories' })
export class LoginHistory {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string

  @Prop({ type: Date, required: true })
  loginTime: Date;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

}
export const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
LoginHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});