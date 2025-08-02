

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUrl, IsNumber } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
export class CreateVersionUpdateDto {

  @ApiProperty({ example: 'iOS' })
  @IsString()
  readonly platform: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly versionCode: number;

  @ApiProperty({ 
    example: 'optional',
    enum: ['optional', 'normal', 'force'],
  })
  @IsEnum(['optional', 'normal', 'force'])
  readonly forceUpdate: string;

  @ApiProperty({ example: 'https://example.com/app' })
  @IsOptional()
  @IsUrl()
  readonly appLink?: string;

  @ApiProperty({ example: 'This is an update message.' })
  @IsOptional()
  @IsString()
  readonly message?: string;

  @ApiProperty({ 
    example: 'ACTIVE',
    enum: Status,
  })
  @IsEnum(Status)
  readonly status: Status;
}
