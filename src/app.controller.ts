import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('instructions/:filename')
  getInstructions(@Param('filename') filename: string) {
    return this.appService.getInstructions(filename);
  }
}
