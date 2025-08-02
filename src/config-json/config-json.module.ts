import { Module } from '@nestjs/common';
import { ConfigJsonController } from './config-json.controller';
import { ConfigJsonService } from './config-json.service';
import { Config, ConfigSchema } from './config-json.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }])
  ],
  controllers: [ConfigJsonController],
  providers: [ConfigJsonService, ResponseService],
  exports: [ConfigJsonService],
})
export class ConfigJsonModule {}
