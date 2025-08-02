
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedCountryDto {
  @ApiProperty({ example: 'India' })
  @IsString()
  readonly countryName: string;

  @ApiProperty({ example: '+91' })
  @IsString()
  readonly countryCode: string;
  
  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}