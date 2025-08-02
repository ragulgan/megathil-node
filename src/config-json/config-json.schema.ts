import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Config extends Document {
  @Prop({ type: Object })
  applicationJson: any;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
ConfigSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});