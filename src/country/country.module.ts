import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CountryService } from './country.service';
import { Country, CountrySchema } from './country.schema';
import { CountryController } from './country.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])
  ],
  controllers: [CountryController],
  providers: [CountryService, ResponseService],
  exports: [CountryService],
})
export class CountryModule {}