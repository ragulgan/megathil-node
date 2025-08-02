
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedCityDto {
  @ApiProperty({ example: '663b5d30a8b23b5f0b848681' })
  @IsString()
  readonly countryId: string;

  @ApiProperty({ example: '663b641b40ca563372bdea86' })
  @IsString()
  readonly stateId: string;

  @ApiProperty({ example: 'Chennai' })
  @IsString()
  readonly cityName: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}