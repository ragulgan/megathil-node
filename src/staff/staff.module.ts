import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffService } from './staff.service';
import { Staff, StaffSchema } from './staff.schema';
import { StaffController } from './staff.controller';
import { ResponseService } from '../base/controller';
import { StaffActivities, StaffActivitiesSchema } from './staffActivities.schema';
import { AdminModule } from '../adminUsers/admin.module';
import { EmailServiceModule } from '../emailService/emailService.module';

@Module({
  imports: [
    AdminModule,
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
    MongooseModule.forFeature([{ name: StaffActivities.name, schema: StaffActivitiesSchema }]),
    EmailServiceModule
  ],
  controllers: [StaffController],
  providers: [StaffService, ResponseService],
  exports: [StaffService, MongooseModule],
})
export class StaffModule { }
