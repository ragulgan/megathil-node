import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExperiencePointsService } from './Xp.service';
import { ExperiencePoints, ExperiencePointsSchema } from './Xp.schema';
import { ExperiencePointsController } from './Xp.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExperiencePoints.name, schema: ExperiencePointsSchema }])
  ],
  controllers: [ExperiencePointsController],
  providers: [ExperiencePointsService, ResponseService],
  exports: [ExperiencePointsService],
})
export class ExperiencePointsModule {}
