import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { ResponseService } from 'src/base/controller';
import { InterviewerAvailabilities, InterviewerAvailabilitiesSchema } from './interviewerAvailability.schema';
import { InterviewerActivity, InterviewerActivitySchema } from 'src/interviewer/interviewerActivites.schema';
import { UserBookings, UserBookingsSchema } from './userBookings.schema';
import { InterviewerModule } from 'src/interviewer/interviewer.module';
import { Interviewer, InterviewerSchema } from 'src/interviewer/interviewer.schema';
import { User, UserSchema } from 'src/users/users.schema';
import { Gems, GemsSchema } from 'src/gems/gems.schema';
import { Transaction, TransactionSchema } from 'src/transaction/transactions.schema';
import { UserEarnings, UserEarningsSchema } from 'src/users/userEarnings.schema';
import { InterviewRatings, InterviewRatingsSchema } from './interviewRating.schema';
import { NotificationModule } from '../notification/notification.module';
import { Notification, NotificationSchema } from 'src/notification/notification.schema';
import { EmailServiceModule } from '../emailService/emailService.module';
import { Modules, ModuleSchema } from 'src/module/module.schema';
import { Unit, UnitSchema } from 'src/unit/unit.schema';
import { UserProgressStatus, UserProgressStatusSchema } from 'src/users/userProgressStatus.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: InterviewerAvailabilities.name, schema: InterviewerAvailabilitiesSchema }]),
    MongooseModule.forFeature([{ name: UserBookings.name, schema: UserBookingsSchema }]),
    MongooseModule.forFeature([{ name: InterviewerActivity.name, schema: InterviewerActivitySchema }]),
    MongooseModule.forFeature([{ name: Interviewer.name, schema: InterviewerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Gems.name, schema: GemsSchema }]),
    MongooseModule.forFeature([{ name: UserEarnings.name, schema: UserEarningsSchema }]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: InterviewRatings.name, schema: InterviewRatingsSchema }]),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: UserProgressStatus.name, schema: UserProgressStatusSchema }]),
    InterviewerModule,
    NotificationModule,
    EmailServiceModule
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService, ResponseService]
})
export class InterviewsModule { }
