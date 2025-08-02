import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class MobileCode extends Document {
  @Prop({ type: Object })
  mobilecodeJson: any;
}

export const MobileCodeSchema = SchemaFactory.createForClass(MobileCode);
MobileCodeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});