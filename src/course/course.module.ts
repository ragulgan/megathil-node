import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './course.schema';
import { CourseController } from './course.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }])
  ],
  controllers: [CourseController],
  providers: [CourseService, ResponseService],
  exports: [CourseService],
})
export class CourseModule {}
