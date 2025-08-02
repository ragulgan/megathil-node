import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievements, AchievementsSchema } from './achievements.schema';
import { ResponseService } from 'src/base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Achievements.name, schema: AchievementsSchema }])
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService, ResponseService]
})
export class AchievementsModule { }
