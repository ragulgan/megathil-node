import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Badges extends mongoose.Document {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  shortNote: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const BadgesSchema = SchemaFactory.createForClass(Badges);
BadgesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret?._id?.toString();
    delete ret?._id;
    return ret;
  },
});