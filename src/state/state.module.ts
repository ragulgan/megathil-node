import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateService } from './state.service';
import { State, StateSchema } from './state.schema';
import { StateController } from './state.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: State.name, schema: StateSchema }])
  ],
  controllers: [StateController],
  providers: [StateService, ResponseService],
  exports: [StateService],
})
export class StateModule {}