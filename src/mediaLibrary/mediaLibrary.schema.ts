import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
enum LibraryStatus {
  PUBLISHED = 'PUBLISHED',
  PUBLISH = 'PUBLISH',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

enum Type {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })

export class MediaLibrary {

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  url: string;

  @Prop()
  titleImage: string;

  @Prop()
  category: string;

  @Prop()
  summary: string;
  
  @Prop({ enum: Type, default: Type.AUDIO })
  type: Type;

  @Prop({ enum: LibraryStatus, default: LibraryStatus.PUBLISHED })
  libraryStatus: LibraryStatus;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'College' })
  collegeId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Staff' })
  staffId: string;
}
export const MediaLibrarychema = SchemaFactory.createForClass(MediaLibrary);
MediaLibrarychema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});