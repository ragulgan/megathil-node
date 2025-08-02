import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsArray } from 'class-validator';
import { ServiceDaysDto } from './serviceDays.dto';

export class InterviewerAvailabilityDto {
  @ApiProperty({ example: 'React Interview' })
  @IsString()
  readonly scheduleName: string;

  @ApiProperty({ example: 'NONE or WEEKLY or MONTHLY' })
  @IsString()
  readonly frequency: string;

  @ApiProperty({ type: Number, isArray: true })
  @IsArray()
  readonly weeksOfMonth: number[];

  @ApiProperty({ type: ServiceDaysDto, isArray: true })
  readonly serviceDays: ServiceDaysDto[]

  @ApiProperty({ example: '30', description: 'Duration in minutes.' })
  readonly slotDuration: number;

  @ApiProperty({ example: '2024-06-09T09:52:38Z' })
  @IsDateString()
  readonly startDate: Date;

  @ApiProperty({ example: '2024-07-09T09:52:38Z' })
  @IsDateString()
  readonly endDate: Date;

  @ApiProperty({ example: 'Available to take react interview on every Monday monring before lunch.' })
  @IsString()
  readonly description: string;

  @ApiProperty({ example: 'AVAILABILITY or LEAVE or HOLIDAY' })
  @IsString()
  readonly type: string;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  readonly status: string;
}