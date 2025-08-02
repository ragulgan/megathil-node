import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Institute extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  shortDescription: string;

  @Prop()
  instituteCode: string;

  @Prop()
  instituteLogo: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;
}

export const InstituteSchema = SchemaFactory.createForClass(Institute);
InstituteSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});