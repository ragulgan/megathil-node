import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionTypeService } from './questionType.service';
import { QuestionType, QuestionTypeSchema } from './questionType.schema';
import { QuestionTypeController } from './questionType.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QuestionType.name, schema: QuestionTypeSchema }])
  ],
  controllers: [QuestionTypeController],
  providers: [QuestionTypeService, ResponseService],
  exports: [QuestionTypeService],
})
export class QuestionTypeModule { }
