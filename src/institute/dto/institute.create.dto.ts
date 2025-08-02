import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateInstituteDto {
  @ApiProperty({ example: 'SRM Institute of Science & Technology' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'an educational institution that offers postsecondary education and awards degrees' })
  readonly shortDescription: string;

  @ApiProperty({ example: '18LEH101J' })
  readonly instituteCode: string;

  @ApiProperty({ example: 'imagename.jpg' })
  @IsOptional()
  @IsString()
  readonly instituteLogo: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}