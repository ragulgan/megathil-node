import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ResponseService } from '../base/controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.schema';
import { AdminActivity, AdminActivitySchema } from './adminActivites.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([{ name: AdminActivity.name, schema: AdminActivitySchema }])
  ],
  controllers: [AdminController],
  providers: [AdminService, ResponseService, AdminActivity],
  exports: [AdminService, MongooseModule, AdminActivity],
})
export class AdminModule { }