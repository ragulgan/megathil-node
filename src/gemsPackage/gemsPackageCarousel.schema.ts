import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, timestamps: true })
export class GemsPackageCarousel extends mongoose.Document {

  @Prop()
  title: string;

  @Prop()
  note: string;

  @Prop()
  imageUrl: string;

  @Prop()
  displayOrder: number;

  @Prop({ unique: true })
  promoCode: string;

  @Prop()
  percentage: number;

  @Prop()
  validStartDate: Date;

  @Prop()
  validEndDate: Date;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'College' })
  college: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PromoCode' })
  promotorId: string;

  @Prop({ type: Boolean, default: false })
  isLMSOffer: boolean;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Topics', required: false }])
  topicsId: Array<any>;
}

export const GemsPackageCarouselSchema = SchemaFactory.createForClass(GemsPackageCarousel);
GemsPackageCarouselSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});