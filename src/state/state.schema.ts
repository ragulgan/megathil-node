import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class State {

  @Prop({ required: true, unique: true, trim: true })
  stateName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country' })
  countryId: String

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE'
  })
  status: string;
}

export const StateSchema = SchemaFactory.createForClass(State);

StateSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});