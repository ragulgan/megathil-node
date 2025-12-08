import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LmsQuestionResponseService } from './lmsQuestionResponse.service';
import { LmsProgressStatus, LmsProgressStatusSchema } from './lmsQuestionResponse.schema';
import { LmsUserHistory, LmsUserHistorySchema } from './lmsUserHistory.schema';
import { LmsQuestionResponseController } from './lmsQuestionResponse.controller';
import { ResponseService } from '../base/controller';
import { Topics, TopicsSchema } from 'src/topics/topics.schema';
import { SubTopics, SubTopicSchema } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1, SubTopic1Schema } from 'src/sub-topics1/sub-topic1.schema';
import { LmsTest, LmsTestSchema } from 'src/lmsTest/lmsTest.schema';
import { LmsQuestion, LmsQuestionSchema } from 'src/lmsQuestion/lmsQuestion.schema';
import { LmsOption, LmsOptionSchema } from 'src/lmsOption/lmsOption.schema';
import { UserModule } from 'src/users/users.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: LmsProgressStatus.name, schema: LmsProgressStatusSchema }]),
    MongooseModule.forFeature([{ name: LmsUserHistory.name, schema: LmsUserHistorySchema }]),
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([{ name: SubTopics.name, schema: SubTopicSchema }]),
    MongooseModule.forFeature([{ name: SubTopics1.name, schema: SubTopic1Schema }]),
    MongooseModule.forFeature([{ name: LmsTest.name, schema: LmsTestSchema }]),
    MongooseModule.forFeature([{ name: LmsQuestion.name, schema: LmsQuestionSchema }]),
    MongooseModule.forFeature([{ name: LmsOption.name, schema: LmsOptionSchema }]),
    UserModule,
  ],
  controllers: [LmsQuestionResponseController],
  providers: [LmsQuestionResponseService, ResponseService],
  exports: [LmsQuestionResponseService],
})
export class LmsQuestionResponseModule { }