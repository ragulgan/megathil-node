import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleService } from './module.service';
import { Modules, ModuleSchema } from './module.schema';
import { ModuleController } from './module.controller';
import { ResponseService } from '../base/controller';
import { Unit, UnitSchema } from 'src/unit/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
  ],
  controllers: [ModuleController],
  providers: [ModuleService, ResponseService],
  exports: [ModuleService],
})
export class ModuleModal { }
