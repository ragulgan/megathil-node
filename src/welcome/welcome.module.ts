import { Module } from '@nestjs/common';
import { WelcomeController } from './welcome.controller';
import { WelcomeService } from './welcome.service';
import { ResponseService } from '../base/controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Welcome, WelcomeSchema } from './welcome.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Welcome.name, schema: WelcomeSchema }])],  
  controllers: [WelcomeController],
  providers: [WelcomeService , ResponseService ],
})
export class WelcomeModule {}