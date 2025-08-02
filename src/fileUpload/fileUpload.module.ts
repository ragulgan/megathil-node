import { Module } from '@nestjs/common';
import { FileUploadController } from './fileUpload.controller';
import { ResponseService } from '../base/controller';
import { AwsModule } from './aws.module'
import { FileUpload, FileUploadSchema } from './fileUpload.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AwsModule,
    AuthModule,
    MongooseModule.forFeature([{ name: FileUpload.name, schema: FileUploadSchema }]),
  ],
  providers: [ResponseService],
  controllers: [FileUploadController]
})
export class FileUploadModule {}
