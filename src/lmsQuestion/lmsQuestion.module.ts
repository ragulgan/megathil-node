import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LMSQustionsService } from './lmsQuestion.service';
import { LmsQuestion, LmsQuestionSchema } from './lmsQuestion.schema';
import { LmsQuestionController } from './lmsQuestion.controller';
import { ResponseService } from '../base/controller';
import { Topics, TopicsSchema } from 'src/topics/topics.schema';
import { SubTopics, SubTopicSchema } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1, SubTopic1Schema } from 'src/sub-topics1/sub-topic1.schema';
import { LmsTest, LmsTestSchema } from 'src/lmsTest/lmsTest.schema';
import { LmsProgressStatus, LmsProgressStatusSchema } from 'src/lmsQuestionResponse/lmsQuestionResponse.schema';
import { LmsUserHistory, LmsUserHistorySchema } from 'src/lmsQuestionResponse/lmsUserHistory.schema';
import { LmsOption, LmsOptionSchema } from 'src/lmsOption/lmsOption.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: LmsQuestion.name, schema: LmsQuestionSchema }]),
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([{ name: SubTopics.name, schema: SubTopicSchema }]),
    MongooseModule.forFeature([{ name: SubTopics1.name, schema: SubTopic1Schema }]),
    MongooseModule.forFeature([{ name: LmsTest.name, schema: LmsTestSchema }]),
    MongooseModule.forFeature([{ name: LmsProgressStatus.name, schema: LmsProgressStatusSchema }]),
    MongooseModule.forFeature([{ name: LmsUserHistory.name, schema: LmsUserHistorySchema }]),
    MongooseModule.forFeature([{ name: LmsOption.name, schema: LmsOptionSchema }]),
  ],
  controllers: [LmsQuestionController],
  providers: [LMSQustionsService, ResponseService],
  exports: [LMSQustionsService],
})
export class LmsQuestionModule { }