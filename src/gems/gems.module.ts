import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GemsService } from './gems.service';
import { Gems, GemsSchema } from './gems.schema';
import { GemsController } from './gems.controller';
import { ResponseService } from '../base/controller';
import { GemsCount, GemsCountSchema } from './gemsTotal.schema';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gems.name, schema: GemsSchema }]),
    MongooseModule.forFeature([{ name: GemsCount.name, schema: GemsCountSchema }]),
  ],
  controllers: [GemsController],
  providers: [GemsService, ResponseService],
  exports: [GemsService, GemsModule],
})
export class GemsModule {}
