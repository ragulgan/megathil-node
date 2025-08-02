
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedCourseDto {
  @ApiProperty({ example: '6639d814e00d110fc099900b' })
  @IsString()
  readonly departmentId: string;

  @ApiProperty({ example: 'Bachelor of engineering' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'BE' })
  @IsString()
  readonly abbreviation: string;

  @ApiProperty({ example: 'Bachelor degree in engineering' })
  readonly shortDescription: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}