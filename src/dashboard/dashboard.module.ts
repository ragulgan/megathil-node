import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../users/users.schema';
import { ResponseService } from '../base/controller';
import { College, CollegeSchema } from 'src/college/college.schema';
import { GemsModule } from '../gems/gems.module';
import { DashboardController } from './dashboard.controller';
import { GemsCount, GemsCountSchema } from '../gems/gemsTotal.schema';
import { Transaction, TransactionSchema } from 'src/transaction/transactions.schema';
import { UserActivity, UserActivitySchema } from 'src/users/usersActivites.schema';
import { Interviewer, InterviewerSchema } from 'src/interviewer/interviewer.schema';
import { Staff, StaffSchema } from '../staff/staff.schema';
import { UserProgressStatus, UserProgressStatusSchema } from '../users/userProgressStatus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: College.name, schema: CollegeSchema }]),
    MongooseModule.forFeature([{ name: GemsCount.name, schema: GemsCountSchema }]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
    MongooseModule.forFeature([{ name: Interviewer.name, schema: InterviewerSchema }]),
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    MongooseModule.forFeature([{ name: UserProgressStatus.name, schema: UserProgressStatusSchema }]),
    GemsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, ResponseService],
  exports: [DashboardService, MongooseModule],
})
export class DashboardModule { }
