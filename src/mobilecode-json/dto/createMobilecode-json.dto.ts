import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class CreateMobilecodeDto {
  @ApiProperty({ type: Object })
  @IsObject()
  readonly mobilecodeJson: any;
  
}