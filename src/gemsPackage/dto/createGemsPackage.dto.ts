

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CreateGemsPackageDto {
  @ApiProperty({ example: 'Base' })
  @IsString()
  readonly packageName: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  readonly gems: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  readonly gemsPrice: number;

  @ApiProperty({ example: 1.50  })
  @IsNumber()
  readonly costPerGem: number;

  @ApiProperty({ 
    example: 'ACTIVE',
    enum: Status,
    description: 'The status of the package'
  })
  @IsEnum(Status)
  readonly status: Status;
}
