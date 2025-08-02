import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateTypeService } from './templateType.service';
import { TemplateType, TemplateTypeSchema } from './templateType.schema';
import { TemplateTypeController } from './templateType.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TemplateType.name, schema: TemplateTypeSchema }])
  ],
  controllers: [TemplateTypeController],
  providers: [TemplateTypeService, ResponseService],
  exports: [TemplateTypeService],
})
export class TemplateTypeModule {}
