import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemVariablesService } from './systemVariables.service';
import { SystemVariables, SystemVariablesSchema } from './systemVariables.schema';
import { SystemVariablesController } from './systemVariables.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SystemVariables.name, schema: SystemVariablesSchema }])
  ],
  controllers: [SystemVariablesController],
  providers: [SystemVariablesService, ResponseService],
  exports: [SystemVariablesService],
})
export class SystemVariablesModule {}
