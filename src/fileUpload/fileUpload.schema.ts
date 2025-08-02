import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false } , timestamps: true })
export class FileUpload {
  
  @Prop()
  filename: string
  
  @Prop()
  originalname: string;

  @Prop()
  encoding: string;

  @Prop()
  mimetype: string;

  @Prop()
  path: string;

  @Prop()
  size: string;

  @Prop()
  uploadedBy: string;

  @Prop()
  uploadedByRole: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;
 
}
export const FileUploadSchema = SchemaFactory.createForClass(FileUpload);
FileUploadSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString(); 
    delete ret._id; 
    return ret;
  },
});