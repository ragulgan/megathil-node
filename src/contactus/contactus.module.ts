import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseService } from '../base/controller';
import { ContactUs, ContactUsSchema } from './contactus.schema';
import { ContactUsController } from './contactus.controller';
import { ContactUsService } from './contactus.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactUs.name, schema: ContactUsSchema }])
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService, ResponseService],
  exports: [ContactUsService],
})
export class ContactUsModule { }