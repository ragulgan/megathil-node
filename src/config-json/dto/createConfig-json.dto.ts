import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateConfigDto {
  @ApiProperty({ type: Object })
  @IsObject()
  readonly applicationJson: any;
  
}