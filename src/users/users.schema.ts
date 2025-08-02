import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'typeorm';
import { Schema as MongooseSchema } from 'mongoose';
@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'users' })
export class User {

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  dob: Date;

  @Prop({
    type: String,
    enum: ['MALE', 'FEMALE', 'ALLGENDER'],
  })
  gender: string;

  @Prop()
  fatherName: string;

  @Prop({ required: false })
  email: string;

  @Prop()
  studentId: string;

  @Prop({ required: false })
  mobileNumber: string;

  @Prop({ required: false })
  mobileCode: string;

  @Prop({ required: false, trim: true })
  promotedBy: string;

  @Prop()
  alternativeMobileNumber: string;

  @Prop()
  currentAddress: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country' })
  country: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'State' })
  state: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'City' })
  city: string;

  @Prop()
  postalCode: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  course: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  department: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'College' })
  college: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Institute' })
  instituteId: string;

  @Prop()
  otherCollegeName: string;

  @Prop()
  otherDepartmentName: string;

  @Prop()
  otherCourseName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Staff' })
  staff: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'GemsPackage' })
  gemsPackageId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Interviewer' })
  interviewerId: string;

  @Prop()
  isExistUser: boolean;

  @Prop()
  referralCode: string;

  @Prop()
  appliedReferralCode: string;

  @Prop({ default: false })
  referralRewared: boolean;

  @Prop()
  monthAndYearOfPassingOut: Date;

  @Prop()
  profileImage: string;

  @Prop({ enum: ['USER'], default: 'USER' })
  role: string;

  @Prop()
  type: string;

  @Prop()
  deviceId: string;

  @Prop({ enum: ['android', 'ios'] })
  device: string;

  @Prop()
  deviceToken: string;

  @Prop()
  deviceInfo: string;

  @Prop({ type: Number, default: 0 })
  gemValue: number;

  @Prop({ type: Number, default: 0 })
  xpValue: number;

  @Prop({ type: Number, default: 0 })
  megathilPoints: number;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Badges' }])
  badges: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['WEB', 'MOBILE'],
    default: 'WEB'
  })
  source: string;

  @Prop({
    type: String,
    enum: ['BASIC', 'PREMIUM'],
    default: 'BASIC'
  })
  userType: string;

  @Prop()
  internship: string;

  @Prop()
  jobAspiration: string;

  @Prop({
    type: String,
    required: true,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'PENDING'
  })
  status: string;

  @Prop({ default: false })
  unitsCompleted: boolean;

  @Prop({ default: false })
  allowMockInterview: boolean;

  @Prop()
  certificateIssued: boolean;

  @Prop()
  certificateRef: string;

  @Prop({ type: Object })
  certificateStatusInfo: any;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
  id: any;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});