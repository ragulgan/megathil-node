import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewerService } from './interviewer.service';
import { Interviewer, InterviewerSchema } from './interviewer.schema';
import { InterviewerActivity, InterviewerActivitySchema } from './interviewerActivites.schema';
import { InterviewerController } from './interviewer.controller';
import { ResponseService } from '../base/controller';
import { AdminModule } from '../adminUsers/admin.module';
import { EmailServiceModule } from '../emailService/emailService.module';

@Module({
  imports: [
    AdminModule,
    MongooseModule.forFeature([{ name: Interviewer.name, schema: InterviewerSchema }]),
    MongooseModule.forFeature([{ name: InterviewerActivity.name, schema: InterviewerActivitySchema }]),
    EmailServiceModule
  ],
  controllers: [InterviewerController],
  providers: [InterviewerService, ResponseService],
  exports: [InterviewerService],
})
export class InterviewerModule { }
