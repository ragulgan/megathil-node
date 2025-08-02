import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DatetimeDto {
  @ApiProperty({ example: '2024-12-25T09:52:38Z' })
  @IsDateString()
  readonly startDateTime: Date;

  @ApiProperty({ example: '2024-12-09T09:52:38Z' })
  @IsDateString()
  readonly endDateTime: Date;
}