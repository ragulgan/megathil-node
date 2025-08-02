import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginHistoryService } from './service';
import { LoginHistory, LoginHistorySchema } from './schema'; 
import { LoginHistoryController } from './controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: LoginHistory.name, schema: LoginHistorySchema }])],  
  controllers: [LoginHistoryController ],
  providers: [LoginHistoryService , ResponseService],
  exports: [LoginHistoryService],
})
export class LoginHistoryModule {}
