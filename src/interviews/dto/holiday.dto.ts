import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';
import { DatetimeDto } from './datetime.dto';

export class HolidayDto {

  @ApiProperty({ example: 'Chrismas Holiday' })
  @IsString()
  readonly scheduleName: string;

  @ApiProperty({ example: 'Holiday due to Christmas celebration.' })
  @IsString()
  readonly description: string;

  @ApiProperty({ type: DatetimeDto, isArray: true })
  readonly datetimes: DatetimeDto[]

}