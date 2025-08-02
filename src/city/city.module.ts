import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CityService } from './city.service';
import { City, CitySchema } from './city.schema';
import { CityController } from './city.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }])
  ],
  controllers: [CityController],
  providers: [CityService, ResponseService],
  exports: [CityService],
})
export class CityModule {}