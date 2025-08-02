import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'typeorm';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'userGainGem' })
export class UserGainGem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  gems: Number;

  @Prop()
  xp: Number;
}

export const UserGainGemSchema = SchemaFactory.createForClass(UserGainGem);

UserGainGemSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});