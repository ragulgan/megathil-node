import { Module } from '@nestjs/common';
import { ProcessAudioController } from './processAudio.controller';
import { QuestionResponseModule } from '../questionResponse/questionResponse.module'
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionResponse, QuestionResponseSchema } from '../questionResponse/questionResponse.schema';
import { ResponseService } from '../base/controller';
import { userLearningHistory, userLearningHistorySchema } from 'src/userUnitHistory/userUnitHistory.schema';
import { Question, QuestionSchema } from 'src/question/question.schema';
import { UserProgressStatus, UserProgressStatusSchema } from 'src/users/userProgressStatus.schema';
import { Modules, ModuleSchema } from 'src/module/module.schema';
import { UserScores, UserScoresSchema } from 'src/users/userScores.schema';
import { User, UserSchema } from 'src/users/users.schema';
import { UserActivity, UserActivitySchema } from 'src/users/usersActivites.schema';
import { ProcessAudioService } from './processAudio.service';
import { UserScoreHistories, UserScoreHistoriesSchema } from 'src/users/userScoreHistory.schema';
import { Unit, UnitSchema } from 'src/unit/unit.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    QuestionResponseModule,
    MongooseModule.forFeature([{ name: QuestionResponse.name, schema: QuestionResponseSchema }]),
    MongooseModule.forFeature([{ name: userLearningHistory.name, schema: userLearningHistorySchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: UserProgressStatus.name, schema: UserProgressStatusSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: UserScores.name, schema: UserScoresSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
    MongooseModule.forFeature([{ name: UserScoreHistories.name, schema: UserScoreHistoriesSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    HttpModule
  ],
  controllers: [ProcessAudioController],
  providers: [ProcessAudioService, ResponseService],
})
export class ProcessAudioModule { }
