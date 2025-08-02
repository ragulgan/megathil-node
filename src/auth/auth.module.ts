import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UsersService } from "../users/users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/users.schema";
import { UserModule } from "../users/users.module";
import { LocalStrategy } from './local.auth';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { Otp, OtpSchema } from '../otp/otp.schema';
import { ResponseService } from '../base/controller';
import { AdminService } from 'src/adminUsers/admin.service';
import { Admin, AdminSchema } from "src/adminUsers/admin.schema";
import { LoginHistory, LoginHistorySchema } from "src/loginHistory/schema";
import { LoginHistoryModule } from 'src/loginHistory/module';
import { OtpService } from "src/otp/otp.service";
import { StaffService } from "src/staff/staff.service";
import { Staff, StaffSchema } from "src/staff/staff.schema";
import { InterviewerModule } from '../interviewer/interviewer.module';
import { UserEarnings, UserEarningsSchema } from "src/users/userEarnings.schema";
import { UserActivity, UserActivitySchema } from '../users/usersActivites.schema';
import { UserProgressStatus, UserProgressStatusSchema } from "src/users/userProgressStatus.schema";
import { StaffActivities, StaffActivitiesSchema } from "src/staff/staffActivities.schema";
import { UserTrophies, UserTrophiesSchema } from "src/users/userTrophies.schema";
import { Unit, UnitSchema } from "src/unit/unit.schema";
import { ModuleSchema, Modules } from "src/module/module.schema";
import { Question, QuestionSchema } from "src/question/question.schema";
import { Achievements, AchievementsSchema } from "src/achievements/achievements.schema";
import { TransactionModule } from "../transaction/transactions.module";
import { GemsPackageModule } from "../gemsPackage/gemsPackage.module";
import { AdminActivity, AdminActivitySchema } from '../adminUsers/adminActivites.schema';
import { EmailServiceModule } from '../emailService/emailService.module';
import { NotificationModule } from '../notification/notification.module';
import { UserUnitHistoryModule } from "src/userUnitHistory/userUnitHistory.module";
import { PromoCode, PromoCodeSchema } from "../Promotors/promotor.schema";
import { PromoCodeService } from "../Promotors/promotor.service";
import { PromotorActivity, PromotorActivitySchema } from "../Promotors/promotor.Activities.schema";

@Module({
  imports: [
    UserUnitHistoryModule,
    NotificationModule,
    EmailServiceModule,
    GemsPackageModule,
    TransactionModule,
    UserModule,
    PassportModule,
    LoginHistoryModule,
    InterviewerModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // secret: process.env.JWT_SECRET,
      // secret: 'mySecretKey123', // change for prod
      // signOptions: { expiresIn: '30d' },
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret key from env
        signOptions: { expiresIn: '30d' },
      }),
    }),
    MongooseModule.forFeature([{ name: AdminActivity.name, schema: AdminActivitySchema }]),
    MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    MongooseModule.forFeature([{ name: StaffActivities.name, schema: StaffActivitiesSchema }]),
    MongooseModule.forFeature([{ name: LoginHistory.name, schema: LoginHistorySchema }]),
    MongooseModule.forFeature([{ name: UserEarnings.name, schema: UserEarningsSchema }]),
    MongooseModule.forFeature([{ name: UserProgressStatus.name, schema: UserProgressStatusSchema }]),
    MongooseModule.forFeature([{ name: UserTrophies.name, schema: UserTrophiesSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: Achievements.name, schema: AchievementsSchema }]),
    MongooseModule.forFeature([{ name: PromoCode.name, schema: PromoCodeSchema }]),
    MongooseModule.forFeature([{ name: PromotorActivity.name, schema: PromotorActivitySchema }]),
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, UsersService, LocalStrategy, OtpService, LocalStrategy, JwtAuthGuard, JwtStrategy, ResponseService, AdminService, StaffService, PromoCodeService],
})
export class AuthModule { }
