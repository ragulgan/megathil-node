import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpService } from './otp.service'; 
import { OtpController } from './otp.controller';
import { Otp, OtpSchema } from './otp.schema';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  controllers: [OtpController],
  providers: [OtpService, ResponseService], 
  exports: [OtpService],
})
export class OtpModule {}
