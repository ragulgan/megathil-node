import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitService } from './unit.service';
import { Unit, UnitSchema } from './unit.schema';
import { UnitController } from './unit.controller';
import { ResponseService } from '../base/controller';
import { ModuleSchema, Modules } from '../module/module.schema';
import { ModuleModal } from '../module/module.module'; // Import ModuleModel
import { SystemVariables, SystemVariablesSchema } from 'src/systemVariables/systemVariables.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Modules.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: SystemVariables.name, schema: SystemVariablesSchema }]),
  ],
  controllers: [UnitController],
  providers: [UnitService, ResponseService,],
  exports: [UnitService],
})
export class UnitModule { }
