
import { Status } from '../moduleType.schema'
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedModuleTypeDto {
  @ApiProperty({ example: 'AnalyticsModule' })
  @IsString()
  readonly displayName: string;

  @ApiProperty({ example: 'Real-time Data Analysis' })
  @IsString()
  readonly displayValue: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  readonly status: string;
}