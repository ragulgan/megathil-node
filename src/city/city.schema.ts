import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class City {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country' })
  countryId: String

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'State' })
  stateId: String

  @Prop({trim: true})
  cityName: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE'
  })  
  status: string;
}

export const CitySchema = SchemaFactory.createForClass(City);

CitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString(); 
    delete ret._id; 
    return ret;
  },
});