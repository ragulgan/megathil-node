import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaLibraryService } from './mediaLibrary.service';
import { MediaLibrary, MediaLibrarychema } from './mediaLibrary.schema';
import { MediaLikes, MediaLikeschema } from './mediaLikes.schema';
import { MediaLibraryController } from './mediaLibrary.controller';
import { ResponseService } from '../base/controller';
import { NotificationModule } from 'src/notification/notification.module';
import { Notification, NotificationSchema } from 'src/notification/notification.schema';
import { User, UserSchema } from 'src/users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MediaLibrary.name, schema: MediaLibrarychema }]),
    MongooseModule.forFeature([{ name: MediaLikes.name, schema: MediaLikeschema }]),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    NotificationModule
  ],
  controllers: [MediaLibraryController],
  providers: [MediaLibraryService, ResponseService],
  exports: [MediaLibraryService],
})
export class MediaLibraryModule {}
