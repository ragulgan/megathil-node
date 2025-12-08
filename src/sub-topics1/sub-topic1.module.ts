import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubTopic1Service } from './sub-topic1.service';
import { SubTopics1, SubTopic1Schema } from './sub-topic1.schema';
import { SubTopics1Controller } from './sub-topic1.controller';
import { ResponseService } from '../base/controller';
import { Topics, TopicsSchema } from 'src/topics/topics.schema';
import { SubTopics, SubTopicSchema } from 'src/sup-topics/sub-topics.schema';
import { LmsTest, LmsTestSchema } from 'src/lmsTest/lmsTest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubTopics1.name, schema: SubTopic1Schema }]),
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([{ name: SubTopics.name, schema: SubTopicSchema }]),
    MongooseModule.forFeature([{ name: LmsTest.name, schema: LmsTestSchema }]),
  ],
  controllers: [SubTopics1Controller],
  providers: [SubTopic1Service, ResponseService],
  exports: [SubTopic1Service],
})
export class SubTopics1Module { }