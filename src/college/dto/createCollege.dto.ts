import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCollegeDto {
  @ApiProperty({ example: 'SRM Institute of Science & Technology' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'an educational institution that offers postsecondary education and awards degrees' })
  readonly shortDescription: string;

  @ApiProperty({ example: '18LEH101J' })
  readonly collegeCode: string;

  @ApiProperty({ example: 'imagename.jpg' })
  @IsString()
  readonly collegeLogo: string;

  @ApiProperty({ example: 10 })
  readonly premiumUserAlloted: number;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Institute ID' })
  @IsOptional()
  readonly instituteId: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  readonly isLmsCollege: boolean;

  @ApiProperty({ example: ['66337243078cdeef0c68ba70', '663372c197da03ab6d864053'], description: 'Topics ID' })
  @IsOptional()
  readonly topicsId: string[];
}