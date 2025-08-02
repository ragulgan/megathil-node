import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'typeorm';

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'roles' })
export class Role {

  @Prop({ required: true, unique: true })
  role: string;

  @Prop({ required: true, unique: true })
  displayName: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

}
export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});