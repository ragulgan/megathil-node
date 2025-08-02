import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollegeService } from './college.service';
import { College, CollegeSchema } from './college.schema';
import { CollegeController } from './college.controller';
import { ResponseService } from '../base/controller';
import { StaffModule } from '../staff/staff.module';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: College.name, schema: CollegeSchema }]),
    StaffModule,
    UserModule
  ],
  controllers: [CollegeController],
  providers: [CollegeService, ResponseService],
  exports: [CollegeService, MongooseModule],
})
export class CollegeModule {}
