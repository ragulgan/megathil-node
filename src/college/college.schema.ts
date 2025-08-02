import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class College extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  shortDescription: string;

  @Prop()
  collegeCode: string;

  @Prop()
  collegeLogo: string;

  @Prop({ type: Number, default: 0 })
  premiumUserUtilized: number;

  @Prop({ type: Number, default: 0 })
  premiumUserAlloted: number;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Institute' })
  instituteId: string;
}

export const CollegeSchema = SchemaFactory.createForClass(College);
CollegeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});