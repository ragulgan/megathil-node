
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Status } from './createGems.dto'

export class UpdatedGemsDto {
  @ApiProperty({ example: 'XP' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: '10' })
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