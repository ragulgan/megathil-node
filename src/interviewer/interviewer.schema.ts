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
}

@Schema({
  toJSON: { versionKey: false },
  toObject: { versionKey: false },
  timestamps: true,
})
export class Interviewer {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  qualification: string;

  @Prop()
  experience: number;

  @Prop()
  organization: string;

  @Prop()
  organizationLogo: string;

  @Prop({ enum: Gender, default: Gender.MALE })
  gender: string;

  @Prop()
  profileImage: string;

  @Prop()
  aboutMe: string;

  @Prop()
  website: string;

  @Prop()
  linkedInProfileUrl: string;

  @Prop()
  twitterProfileUrl: string;

  @Prop()
  fbProfileUrl: string;

  @Prop()
  youtubeProfileUrl: string;

  @Prop({ default: 'INTERVIEWER' })
  role: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  otp: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

}

export const InterviewerSchema = SchemaFactory.createForClass(Interviewer);

InterviewerSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
