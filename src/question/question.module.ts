import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionService } from './question.service';
import { Question, QuestionSchema } from './question.schema';
import { QuestionController } from './question.controller';
import { ResponseService } from '../base/controller';
import { ModuleSchema, Modules } from 'src/module/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }])
  ],
  controllers: [QuestionController],
  providers: [QuestionService, ResponseService],
  exports: [QuestionService],
})
export class QuestionModule { }
