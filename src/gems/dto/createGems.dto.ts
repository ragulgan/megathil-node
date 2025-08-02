

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CreateGemsDto {
  @ApiProperty({ example: 'Gems' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: '10' })
  readonly value: number;

  @ApiProperty({ example: 'Achieved by completing module' })
  readonly description: string;

  @ApiProperty({ 
    example: 'ACTIVE',
    enum: Status,
    description: 'The status of the question'
  })
  readonly status: Status;
}
