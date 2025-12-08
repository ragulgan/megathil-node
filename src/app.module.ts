import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './config/logger';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './fileUpload/fileUpload.module';
import { RoleModule } from './role/module'
import { WelcomeModule } from './welcome/welcome.module'
import { StaffModule } from './staff/staff.module'
import { LangModule } from './lang/lang.module'
import { AdminModule } from './adminUsers/admin.module'
import { QuestionModule } from './question/question.module'
import { ModuleModal } from './module/module.module'
import { UnitModule } from './unit/unit.module'
import { MediaLibraryModule } from './mediaLibrary/mediaLibrary.module'
import { LoginHistoryModule } from './loginHistory/module'
import { ProcessAudioModule } from './processAudio/processAudio.module'
import { QuestionTypeModule } from './questionType/questionType.module'
import { TemplateTypeModule } from './templateType/templateType.module'
import { OptionsModule } from './options/options.module'
import { ModuleTypeModule } from './moduleType/moduleType.module'
import { QuestionResponseModule } from './questionResponse/questionResponse.module'
import { UserUnitHistoryModule } from './userUnitHistory/userUnitHistory.module'
import { CollegeModule } from './college/college.module'
import { CourseModule } from './course/course.module'
import { DepartmentModule } from './department/department.module'
import { CountryModule } from './country/country.module'
import { StateModule } from './state/state.module'
import { CityModule } from './city/city.module'
import { InterviewerModule } from './interviewer/interviewer.module';
import { GemsModule } from './gems/gems.module';
import { TrophiesModule } from './trophies/trophies.module';
import { ExperiencePointsModule } from './experiencePoints/Xp.module';
import { TransactionModule } from './transaction/transactions.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AchievementsModule } from './achievements/achievements.module';
import { BadgesModule } from './badges/badges.module';
import { MegathilPointsModule } from './megathil-points/megathil-points.module';
import { GemsPackageModule } from './gemsPackage/gemsPackage.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { ContactUsModule } from './contactus/contactus.module';
import { SystemVariablesModule } from './systemVariables/systemVariables.module';
import { VersionUpdateModule } from './versionUpdate/versionUpdate.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersFeedbackModule } from './userFeedback/userFeedback.module';
import { ConfigJsonModule } from './config-json/config-json.module';
import { InstituteModule } from './institute/institute.module'
import { MobilecodeJsonModule } from './mobilecode-json/mobilecode-json.module';
import { PromotorModule } from './Promotors/promotor.module'
import { TopicsModule } from './topics/topics.module';
import { SubTopicsModule } from './sup-topics/sub-topics.module';
import { SubTopics1Module } from './sub-topics1/sub-topic1.module';
import { TestLevelModule } from './lmsTest/lmsTest.module';
import { LmsQuestionModule } from './lmsQuestion/lmsQuestion.module';
import { LmsOptionModule } from './lmsOption/lmsOption.module';
import { LmsQuestionResponseModule } from './lmsQuestionResponse/lmsQuestionResponse.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), MongooseModule.forRoot(process.env.MONGODB_URL),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST_NAME,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'static'), }),
    AuthModule,
    UserModule,
    StaffModule,
    DashboardModule,
    InterviewerModule,
    FileUploadModule,
    RoleModule,
    WelcomeModule,
    LangModule,
    AdminModule,
    UnitModule,
    ModuleModal,
    QuestionModule,
    QuestionTypeModule,
    MediaLibraryModule,
    LoginHistoryModule,
    ProcessAudioModule,
    TemplateTypeModule,
    OptionsModule,
    ModuleTypeModule,
    QuestionResponseModule,
    UserUnitHistoryModule,
    CollegeModule,
    CourseModule,
    DepartmentModule,
    CountryModule,
    StateModule,
    CityModule,
    GemsModule,
    TrophiesModule,
    ExperiencePointsModule,
    TransactionModule,
    InterviewsModule,
    AchievementsModule,
    BadgesModule,
    MegathilPointsModule,
    GemsPackageModule,
    ContactUsModule,
    SystemVariablesModule,
    VersionUpdateModule,
    NotificationModule,
    UsersFeedbackModule,
    ConfigJsonModule,
    InstituteModule,
    MobilecodeJsonModule,
    PromotorModule,
    TopicsModule,
    SubTopicsModule,
    SubTopics1Module,
    TestLevelModule,
    LmsQuestionModule,
    LmsOptionModule,
    LmsQuestionResponseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}