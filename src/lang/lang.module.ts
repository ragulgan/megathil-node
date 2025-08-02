import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LangService } from './lang.service';
import { Lang, Langchema } from './lang.schema';
import { LangController } from './lang.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lang.name, schema: Langchema }])
  ],
  controllers: [LangController],
  providers: [LangService, ResponseService],
  exports: [LangService],
})
export class LangModule {}
