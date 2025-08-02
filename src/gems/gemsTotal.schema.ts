import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class GemsCount extends mongoose.Document {

  @Prop()
  gemValue: number;

}

export const GemsCountSchema = SchemaFactory.createForClass(GemsCount);
GemsCountSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});