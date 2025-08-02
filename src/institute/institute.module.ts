import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstituteService } from './institute.service';
import { Institute, InstituteSchema } from './institute.schema';
import { InstituteController } from './institute.controller';
import { ResponseService } from '../base/controller';
import { CollegeModule } from '../college/college.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Institute.name, schema: InstituteSchema }]),
    CollegeModule
  ],
  controllers: [InstituteController],
  providers: [InstituteService, ResponseService],
  exports: [InstituteService],
})
export class InstituteModule {}
