import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class GemsPackage extends mongoose.Document {

  @Prop({ required: true })
  packageName: string;

  @Prop()
  gems: number;

  @Prop()
  gemsPrice: number;

  @Prop()
  costPerGem: number;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const GemsPackageSchema = SchemaFactory.createForClass(GemsPackage);
GemsPackageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});