import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class MegathilPointsDto {
  @ApiProperty({ example: 'Module completed' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: '50' })
  readonly value: number;

  @ApiProperty({ example: 'Points given to user on completing a module' })
  readonly description: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: Status,
    description: 'Used to enable or disable megathil points'
  })
  readonly status: Status;
}