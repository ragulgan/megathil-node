import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class MegathilPoints extends mongoose.Document {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, default: 0 })
  value: number;

  @Prop()
  description: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const MegathilPointsSchema = SchemaFactory.createForClass(MegathilPoints);
MegathilPointsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});