import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ResponseService } from 'src/base/controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])
  ],
  providers: [NotificationService, ResponseService],
  controllers: [NotificationController],
  exports: [NotificationService]
})
export class NotificationModule { }
