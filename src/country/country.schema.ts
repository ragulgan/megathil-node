import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Country {

  @Prop({ required: true, unique: true, trim: true })
  countryName: string;

  @Prop({ required: true, unique: true })
  countryCode: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE'
  })
  status: string;
}

export const CountrySchema = SchemaFactory.createForClass(Country);

CountrySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});