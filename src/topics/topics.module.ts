import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicsService } from './topics.service';
import { Topics, TopicsSchema } from './topics.schema';
import { TopicsController } from './topics.controller';
import { ResponseService } from '../base/controller';
import { User, UserSchema } from 'src/users/users.schema';
import { College, CollegeSchema } from 'src/college/college.schema';
import { LmsQuestion, LmsQuestionSchema } from 'src/lmsQuestion/lmsQuestion.schema';
import { SubTopics, SubTopicSchema } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1, SubTopic1Schema } from 'src/sub-topics1/sub-topic1.schema';
import { LmsTest, LmsTestSchema } from 'src/lmsTest/lmsTest.schema';
import { LmsOption, LmsOptionSchema } from 'src/lmsOption/lmsOption.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Topics.name, schema: TopicsSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: College.name, schema: CollegeSchema }]),
    MongooseModule.forFeature([{ name: LmsQuestion.name, schema: LmsQuestionSchema }]),
    MongooseModule.forFeature([{ name: SubTopics.name, schema: SubTopicSchema }]),
    MongooseModule.forFeature([{ name: SubTopics1.name, schema: SubTopic1Schema }]),
    MongooseModule.forFeature([{ name: LmsTest.name, schema: LmsTestSchema }]),
    MongooseModule.forFeature([{ name: LmsOption.name, schema: LmsOptionSchema }]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService, ResponseService,],
  exports: [TopicsService],
})
export class TopicsModule { }
