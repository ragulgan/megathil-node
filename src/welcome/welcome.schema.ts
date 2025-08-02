import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Welcome {

  @Prop()
  image: string;

  @Prop()
  bgImage: string;

  @Prop()
  content: string;

  @Prop()
  title: string;

  @Prop()
  status: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}
export const WelcomeSchema = SchemaFactory.createForClass(Welcome);
WelcomeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString(); 
    delete ret._id; 
    return ret;
  },
});