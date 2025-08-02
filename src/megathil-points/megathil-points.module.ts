import { Module } from '@nestjs/common';
import { MegathilPointsController } from './megathil-points.controller';
import { MegathilPointsService } from './megathil-points.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MegathilPoints, MegathilPointsSchema } from './megathil-points.schema';
import { ResponseService } from 'src/base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MegathilPoints.name, schema: MegathilPointsSchema }])
  ],
  controllers: [MegathilPointsController],
  providers: [MegathilPointsService, ResponseService]
})
export class MegathilPointsModule { }
