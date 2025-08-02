import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userUnitHistoryService } from './userUnitHistory.service';
import { userLearningHistory, userLearningHistorySchema } from './userUnitHistory.schema';
import { userUnitHistoryController } from './userUnitHistory.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: userLearningHistory.name, schema: userLearningHistorySchema }])
  ],
  controllers: [userUnitHistoryController],
  providers: [userUnitHistoryService, ResponseService],
  exports: [userUnitHistoryService],
})
export class UserUnitHistoryModule {}
