

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CreateSystemVariablesDto {
  @ApiProperty({ example: 'test' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: '10' })
  readonly value: string;

  @ApiProperty({ 
    example: 'ACTIVE',
    enum: Status,
  })
  readonly status: Status;
}
