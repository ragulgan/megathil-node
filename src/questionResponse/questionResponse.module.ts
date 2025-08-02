import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionResponseService } from './questionResponse.service';
import { QuestionResponse, QuestionResponseSchema } from './questionResponse.schema';
import { QuestionResponseController } from './questionResponse.controller';
import { ResponseService } from '../base/controller';
import { UserUnitHistoryModule } from '../userUnitHistory/userUnitHistory.module';
import { userLearningHistory, userLearningHistorySchema } from '../userUnitHistory/userUnitHistory.schema';
import { Question, QuestionSchema } from '../question/question.schema';
import { Options, OptionsSchema } from '../options/options.schema';
import { Unit, UnitSchema } from '../unit/unit.schema';
import { Modules, ModuleSchema } from '../module/module.schema';
import { User, UserSchema } from '../users/users.schema';
import { UserModule } from '../users/users.module';
import { UserProgressStatus, UserProgressStatusSchema } from 'src/users/userProgressStatus.schema';
import { UserTrophies, UserTrophiesSchema } from 'src/users/userTrophies.schema';
import { Achievements, AchievementsSchema } from 'src/achievements/achievements.schema';
import { UserScores, UserScoresSchema } from 'src/users/userScores.schema';
import { UserScoreHistories, UserScoreHistoriesSchema } from 'src/users/userScoreHistory.schema';
import { HttpModule } from '@nestjs/axios';
import { UserAchievement, UserAchievementSchema } from 'src/users/userAchievement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QuestionResponse.name, schema: QuestionResponseSchema }]),
    MongooseModule.forFeature([{ name: userLearningHistory.name, schema: userLearningHistorySchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: Options.name, schema: OptionsSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: UserProgressStatus.name, schema: UserProgressStatusSchema }]),
    MongooseModule.forFeature([{ name: UserTrophies.name, schema: UserTrophiesSchema }]),
    MongooseModule.forFeature([{ name: Achievements.name, schema: AchievementsSchema }]),
    MongooseModule.forFeature([{ name: UserScores.name, schema: UserScoresSchema }]),
    MongooseModule.forFeature([{ name: UserScoreHistories.name, schema: UserScoreHistoriesSchema }]),
    MongooseModule.forFeature([{ name: UserAchievement.name, schema: UserAchievementSchema }]),
    UserUnitHistoryModule,
    UserModule,
    HttpModule
  ],
  controllers: [QuestionResponseController],
  providers: [QuestionResponseService, ResponseService],
  exports: [QuestionResponseService],
})
export class QuestionResponseModule { }
