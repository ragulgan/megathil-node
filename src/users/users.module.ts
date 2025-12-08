import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './users.schema';
import { UsersController } from './users.controller';
import { ResponseService } from '../base/controller';
import { OtpModule } from '../otp/otp.module';
import { Otp, OtpSchema } from '../otp/otp.schema';
import { LoginHistory, LoginHistorySchema } from '../loginHistory/schema';
import { LoginHistoryModule } from '../loginHistory/module';
import { UserEarnings, UserEarningsSchema } from './userEarnings.schema';
import { UserActivity, UserActivitySchema } from './usersActivites.schema';
import { UserProgressStatus, UserProgressStatusSchema } from './userProgressStatus.schema';
import { StaffActivities, StaffActivitiesSchema } from 'src/staff/staffActivities.schema';
import { UserTrophies, UserTrophiesSchema } from './userTrophies.schema';
import { Unit, UnitSchema } from 'src/unit/unit.schema';
import { ModuleSchema, Modules } from 'src/module/module.schema';
import { Question, QuestionSchema } from 'src/question/question.schema';
import { Achievements, AchievementsSchema } from 'src/achievements/achievements.schema';
import { TransactionModule } from '../transaction/transactions.module';
import { GemsPackageModule } from '../gemsPackage/gemsPackage.module';
import { UserUnitStatus, UserUnitStatusSchema } from './userUnitStatus.schema';
import { AdminModule } from '../adminUsers/admin.module';
import { SystemVariables, SystemVariablesSchema } from 'src/systemVariables/systemVariables.schema';
import { College, CollegeSchema } from 'src/college/college.schema';
import { Gems, GemsSchema } from 'src/gems/gems.schema';
import { UserScores, UserScoresSchema } from './userScores.schema';
import { GemsModule } from 'src/gems/gems.module';
import { GemsCount, GemsCountSchema } from 'src/gems/gemsTotal.schema';
import { EmailServiceModule } from '../emailService/emailService.module';
import { UserScoreHistories, UserScoreHistoriesSchema } from './userScoreHistory.schema';
import { UserGainGem, UserGainGemSchema } from './userGemsGain.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { Notification, NotificationSchema } from 'src/notification/notification.schema';
import { UserAchievement, UserAchievementSchema } from './userAchievement.schema';
import { UserUnitHistoryModule } from '../userUnitHistory/userUnitHistory.module';
import { userLearningHistory, userLearningHistorySchema } from '../userUnitHistory/userUnitHistory.schema';
import { PromoCode, PromoCodeSchema } from '../Promotors/promotor.schema';
import { Staff, StaffSchema } from '../staff/staff.schema';
import { PaymentWorkTable, PaymentWorkTableSchema } from './paymentWork.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    MongooseModule.forFeature([{ name: LoginHistory.name, schema: LoginHistorySchema }]),
    MongooseModule.forFeature([{ name: UserEarnings.name, schema: UserEarningsSchema }]),
    MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
    MongooseModule.forFeature([{ name: UserProgressStatus.name, schema: UserProgressStatusSchema }]),
    MongooseModule.forFeature([{ name: UserUnitStatus.name, schema: UserUnitStatusSchema }]),
    MongooseModule.forFeature([{ name: UserTrophies.name, schema: UserTrophiesSchema }]),
    MongooseModule.forFeature([{ name: StaffActivities.name, schema: StaffActivitiesSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: Achievements.name, schema: AchievementsSchema }]),
    MongooseModule.forFeature([{ name: SystemVariables.name, schema: SystemVariablesSchema }]),
    MongooseModule.forFeature([{ name: College.name, schema: CollegeSchema }]),
    MongooseModule.forFeature([{ name: Gems.name, schema: GemsSchema }]),
    MongooseModule.forFeature([{ name: UserScores.name, schema: UserScoresSchema }]),
    MongooseModule.forFeature([{ name: GemsCount.name, schema: GemsCountSchema }]),
    MongooseModule.forFeature([{ name: UserScoreHistories.name, schema: UserScoreHistoriesSchema }]),
    MongooseModule.forFeature([{ name: UserGainGem.name, schema: UserGainGemSchema }]),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: UserAchievement.name, schema: UserAchievementSchema }]),
    MongooseModule.forFeature([{ name: userLearningHistory.name, schema: userLearningHistorySchema }]),
    MongooseModule.forFeature([{ name: PromoCode.name, schema: PromoCodeSchema }]),
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    MongooseModule.forFeature([{ name: PaymentWorkTable.name, schema: PaymentWorkTableSchema }]),

    UserUnitHistoryModule,
    OtpModule,
    LoginHistoryModule,
    TransactionModule,
    GemsPackageModule,
    AdminModule,
    GemsModule,
    EmailServiceModule,
    NotificationModule
  ],
  controllers: [UsersController],
  providers: [UsersService, ResponseService],
  exports: [UsersService, MongooseModule],
})
export class UserModule { }
