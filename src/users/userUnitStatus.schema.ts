import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'typeorm';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'userUnitStatus' })
export class UserUnitStatus {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' })
  unitId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  unlocked: boolean;
}

export const UserUnitStatusSchema = SchemaFactory.createForClass(UserUnitStatus);

UserUnitStatusSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});