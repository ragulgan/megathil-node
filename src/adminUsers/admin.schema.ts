import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
const bcrypt = require('bcrypt')
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Admin {

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop({ trim: true })
  password: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  profileImage: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;

}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  }
  next();
});

AdminSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});