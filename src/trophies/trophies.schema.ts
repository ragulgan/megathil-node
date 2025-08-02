import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Trophies extends mongoose.Document {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  description: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const TrophiesSchema = SchemaFactory.createForClass(Trophies);
TrophiesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret?._id?.toString();
    delete ret?._id;
    return ret;
  },
});