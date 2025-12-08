import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubTopicService } from './sub-topics.service';
import { SubTopics, SubTopicSchema } from './sub-topics.schema';
import { SubTopicsController } from './sub-topics.controller';
import { ResponseService } from '../base/controller';
import { Topics, TopicsSchema } from 'src/topics/topics.schema';
import { SubTopics1, SubTopic1Schema } from 'src/sub-topics1/sub-topic1.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubTopics.name, schema: SubTopicSchema }]),
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([{ name: SubTopics1.name, schema: SubTopic1Schema }]),
  ],
  controllers: [SubTopicsController],
  providers: [SubTopicService, ResponseService],
  exports: [SubTopicService],
})
export class SubTopicsModule { }