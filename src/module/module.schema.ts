import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Modules extends Document {

  @Prop()
  moduleId: string;

  @Prop()
  moduleName: string;

  @Prop()
  bgColor: string;

  @Prop()
  imageUrl: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  displayOrder: string;

  @Prop()
  completedPercentage: number;

  @Prop({ type: Boolean, default: false })
  isGenderSpecific: boolean;

  @Prop({ type: Boolean, default: false })
  isScenario: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ModuleType' })
  moduleType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TemplateType' })
  templateType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Gems' })
  gems: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExperiencePoints' })
  xpId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MegathilPoints' })
  megathilPoints: MongooseSchema.Types.ObjectId;

}

export const ModuleSchema = SchemaFactory.createForClass(Modules);

ModuleSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});