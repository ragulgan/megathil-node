import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AchievementsDto {
  @ApiProperty({ example: 'Milestone Master' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'MILESTONE_MASTER' })
  @IsString()
  readonly keyName: string;

  @ApiProperty({ example: 'This achievement provided when a milestone completed.' })
  @IsString()
  readonly shortNote: string;

  @ApiProperty({ example: '5' })
  gemValue: number;

  @ApiProperty({ example: '5' })
  xpValue: number;

  @ApiProperty({ example: '5' })
  megathilPoints: number;

  @ApiProperty({ example: '6662dda389c05e6922411842' })
  badge: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}
