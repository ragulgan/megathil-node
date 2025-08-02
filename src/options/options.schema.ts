import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Options {

  @Prop()
  optionTitle: string;

  @Prop()
  optionValue: string;

  @Prop()
  optionText: string;

  @Prop()
  optionImage: string;

  @Prop()
  imageOptionFemale: string;
  
  @Prop()
  imageOptionAllGenders: string;  

  @Prop()
  optionColour: string;

  @Prop()
  displayOrder: string;

  @Prop()
  validOption: string;

  @Prop()
  tipTitle: string;

  @Prop()
  appropriateDesc: string;

  @Prop()
  inappropriateDesc: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question' })
  questionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Gems' })
  gems: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExperiencePoints' })
  xpId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MegathilPoints' })
  megathilPoints: MongooseSchema.Types.ObjectId;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;
}

export const OptionsSchema = SchemaFactory.createForClass(Options);

OptionsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});