import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class SystemVariables extends mongoose.Document {

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  value: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const SystemVariablesSchema = SchemaFactory.createForClass(SystemVariables);
SystemVariablesSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});