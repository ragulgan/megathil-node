
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Status } from './createSystemVariables.dto'

export class UpdatedSystemVariablesDto {
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