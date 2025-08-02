import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })

export class MediaLikes {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MediaLibrary' })
  mediaId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

}
export const MediaLikeschema = SchemaFactory.createForClass(MediaLikes);
MediaLikeschema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});