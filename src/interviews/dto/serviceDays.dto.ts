import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString } from 'class-validator';

export class ServiceDaysDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly dayOfWeek: number;

  @ApiProperty({ example: '2024-06-09T09:52:38Z' })
  @IsDateString()
  readonly startDateTime: Date;

  @ApiProperty({ example: '2024-07-09T09:52:38Z' })
  @IsDateString()
  readonly endDateTime: Date;
}