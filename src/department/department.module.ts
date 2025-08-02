import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentService } from './department.service';
import { Department, DepartmentSchema } from './department.schema';
import { DepartmentController } from './department.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Department.name, schema: DepartmentSchema }])
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService, ResponseService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
