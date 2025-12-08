import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LmsOptionService } from './lmsOption.service';
import { LmsOption, LmsOptionSchema } from './lmsOption.schema';
import { LmsOptionController } from './lmsOption.controller';
import { ResponseService } from '../base/controller';
import { LmsQuestion, LmsQuestionSchema } from 'src/lmsQuestion/lmsQuestion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LmsOption.name, schema: LmsOptionSchema }]),
    MongooseModule.forFeature([{ name: LmsQuestion.name, schema: LmsQuestionSchema }]),
  ],
  controllers: [LmsOptionController],
  providers: [LmsOptionService, ResponseService],
  exports: [LmsOptionService],
})
export class LmsOptionModule { }