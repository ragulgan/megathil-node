import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Topics {
  @Prop()
  topicId: string;

  @Prop({ required: true })
  topicName: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  displayOrder: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop({
    type: String,
    enum: ['GENERAL', 'COLLEGE'],
  })
  topicSource: string;

  @Prop({ type: Number, default: 0 })
  price: number;
}

export const TopicsSchema = SchemaFactory.createForClass(Topics);
TopicsSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});