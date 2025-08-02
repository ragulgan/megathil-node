import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobilecodeJsonController } from './mobilecode-json.controller';
import { MobilecodeJsonService } from './mobilecode-json.service';
import { MobileCode, MobileCodeSchema } from './mobilecode-json.schema';
import { ResponseService } from 'src/base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MobileCode.name, schema: MobileCodeSchema }])
  ],
  controllers: [MobilecodeJsonController],
  providers: [MobilecodeJsonService, ResponseService]
})
export class MobilecodeJsonModule {}
