import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LmsTestService } from './lmsTest.service';
import { LmsTest, LmsTestSchema } from './lmsTest.schema';
import { TestLevelController } from './lmsTest.controller';
import { ResponseService } from '../base/controller';
import { Topics, TopicsSchema } from 'src/topics/topics.schema';
import { SubTopics, SubTopicSchema } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1, SubTopic1Schema } from 'src/sub-topics1/sub-topic1.schema';
import { LmsQuestion, LmsQuestionSchema } from 'src/lmsQuestion/lmsQuestion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LmsTest.name, schema: LmsTestSchema }]),
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([{ name: SubTopics.name, schema: SubTopicSchema }]),
    MongooseModule.forFeature([{ name: SubTopics1.name, schema: SubTopic1Schema }]),
    MongooseModule.forFeature([{ name: LmsQuestion.name, schema: LmsQuestionSchema }]),
  ],
  controllers: [TestLevelController],
  providers: [LmsTestService, ResponseService],
  exports: [LmsTestService],
})
export class TestLevelModule { }