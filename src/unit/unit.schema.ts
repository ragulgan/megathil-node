import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Unit {
  @Prop()
  unitId: string;

  @Prop()
  unitName: string;

  @Prop()
  bgColor: string;

  @Prop()
  imageUrl: string;

  @Prop()
  displayOrder: string;

  @Prop()
  unlockCostInGems: number;  

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Gems' })
  gems: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExperiencePoints' })
  xpId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MegathilPoints' })
  megathilPoints: MongooseSchema.Types.ObjectId;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
UnitSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});