import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersFeedbackService } from './userFeedback.service';
import { FeedBack, FeedBackSchema } from './userFeedback.schema';
import { UserFeedbackController } from './userFeedback.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeedBack.name, schema: FeedBackSchema }])
  ],
  controllers: [UserFeedbackController],
  providers: [UsersFeedbackService, ResponseService],
  exports: [UsersFeedbackService, MongooseModule],
})
export class UsersFeedbackModule {}