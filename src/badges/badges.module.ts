import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Badges, BadgesSchema } from './badges.schema';
import { ResponseService } from 'src/base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Badges.name, schema: BadgesSchema }])
  ],
  controllers: [BadgesController],
  providers: [BadgesService, ResponseService]
})
export class BadgesModule { }
