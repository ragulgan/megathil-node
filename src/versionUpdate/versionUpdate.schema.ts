import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class VersionUpdate extends mongoose.Document {

  @Prop({ required: true, unique: true })
  platform: string;

  @Prop({ required: true, unique: true })
  versionCode: number;
  
  @Prop({ enum: ['optional', 'normal', 'force'], default: 'optional' })
  forceUpdate: string;

  @Prop()
  appLink: string;

  @Prop()
  message: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const VersionUpdateSchema = SchemaFactory.createForClass(VersionUpdate);
VersionUpdateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});