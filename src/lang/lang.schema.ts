import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false } , timestamps: true })

export class Lang {

  @Prop()
  name: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;
 
  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}


export const Langchema = SchemaFactory.createForClass(Lang);
Langchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString(); 
    delete ret._id; 
    return ret;
  },
});