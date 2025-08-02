import { Module } from '@nestjs/common';
import { TrophiesController } from './trophies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TrophiesService } from './trophies.sercie';
import { Trophies, TrophiesSchema } from './trophies.schema';
import { ResponseService } from 'src/base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trophies.name, schema: TrophiesSchema }])
  ],
  controllers: [TrophiesController],
  providers: [TrophiesService, ResponseService],
})
export class TrophiesModule { }
