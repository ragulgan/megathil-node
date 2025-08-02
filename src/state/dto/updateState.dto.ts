
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedStateDto {
  @ApiProperty({ example: '663b5d30a8b23b5f0b848681' })
  @IsString()
  readonly countryId: string;

  @ApiProperty({ example: 'TamilNadu' })
  @IsString()
  readonly stateName: string;
  
  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}