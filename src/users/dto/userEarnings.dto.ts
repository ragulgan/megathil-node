import { ApiProperty } from '@nestjs/swagger';

export class UserEarningsDto {
  @ApiProperty({ example: '663de1484059f8ab73dd0eaa' })
  userId: string;
  @ApiProperty({ example: '663de1484059f8ab73dd0eaa' })
  gemId: string;
  @ApiProperty({ example: '50' })
  gemValue: number;
  @ApiProperty({ example: '663de1484059f8ab73dd0eaa' })
  xdId: string;
  @ApiProperty({ example: '10' })
  xdValue: number;
  @ApiProperty({ example: '663de1484059f8ab73dd0eaa' })
  trophyId: string;
  @ApiProperty({ example: 'Became' })
  trophyName: string;
  @ApiProperty({ example: '663c9f139a88b220fbdd88aa' })
  unitId: string;
  @ApiProperty({ example: '663c77177c5daf0f143a012b' })
  moduleId: string;
  @ApiProperty({ example: 'registered' })
  action: string;
  @ApiProperty({ example: 'Earned gems' })
  activity: string;
  @ApiProperty({ example: 'Earned gems by registered' })
  reason: string;
  @ApiProperty({ example: 'EARNED' })
  earnedOrSpent: string;
}