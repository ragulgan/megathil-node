import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionsService } from './options.service';
import { Options, OptionsSchema } from './options.schema';
import { OptionsController } from './options.controller';
import { ResponseService } from '../base/controller';
import { Question, QuestionSchema } from 'src/question/question.schema';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Options.name, schema: OptionsSchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    QuestionModule,
  ],
  controllers: [OptionsController],
  providers: [OptionsService, ResponseService],
  exports: [OptionsService],
})
export class OptionsModule { }
