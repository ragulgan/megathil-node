import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class FeedBack extends mongoose.Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  ticket: string;

  @Prop()
  title: string;

  @Prop()
  comments: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: string;

}

export const FeedBackSchema = SchemaFactory.createForClass(FeedBack);
FeedBackSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});