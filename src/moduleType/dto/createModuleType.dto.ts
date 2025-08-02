import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { Status } from '../moduleType.schema'

export class CreateModuleTypeDto {
  @ApiProperty({ example: 'AnalyticsModule' })
  @IsString()
  readonly displayName: string;

  @ApiProperty({ example: 'Real-time Data Analysis' })
  @IsString()
  readonly displayValue: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  readonly status: string;
}
