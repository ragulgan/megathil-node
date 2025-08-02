import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class Course extends mongoose.Document {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Department' })
  departmentId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  abbreviation: string;

  @Prop()
  shortDescription: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;

}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});