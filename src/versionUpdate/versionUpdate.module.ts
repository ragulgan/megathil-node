import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VersionUpdateService } from './versionUpdate.service';
import { VersionUpdate, VersionUpdateSchema } from './versionUpdate.schema';
import { VersionUpdateController } from './versionUpdate.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VersionUpdate.name, schema: VersionUpdateSchema }])
  ],
  controllers: [VersionUpdateController],
  providers: [VersionUpdateService, ResponseService],
  exports: [VersionUpdateService],
})
export class VersionUpdateModule {}
