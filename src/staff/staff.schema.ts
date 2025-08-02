import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  NOT_SPECIFIED = 'NOT_SPECIFIED'
}
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })

export class Staff {

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  mobileNumber: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ enum: Gender, default: Gender.NOT_SPECIFIED })
  gender: string;

  @Prop({ type: String })
  profileImage: string;

  @Prop({ required: true, unique: true })
  staffId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'College' })
  college: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Department' })
  department: string;

  @Prop({ enum: ['STAFF'], default: 'STAFF' })
  role: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  createdBy: string;

  @Prop()
  otp: string;

  @Prop()
  updatedBy: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
StaffSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
