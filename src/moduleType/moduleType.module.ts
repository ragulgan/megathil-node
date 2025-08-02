import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleTypeService } from './moduleType.service';
import { ModuleType, ModuleTypeSchema } from './moduleType.schema';
import { ModuleTypeController } from './moduleType.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModuleType.name, schema: ModuleTypeSchema }])
  ],
  controllers: [ModuleTypeController],
  providers: [ModuleTypeService, ResponseService],
  exports: [ModuleTypeService],
})
export class ModuleTypeModule {}