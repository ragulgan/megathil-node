

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CreateExperiencePointsDto {
  @ApiProperty({ example: 'XP' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: '1000' })

  readonly value: number;

  @ApiProperty({ example: 'Achieved by completing tasks' })
  readonly description: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: Status,
    description: 'The status of the question'
  })
  readonly status: Status;
}
