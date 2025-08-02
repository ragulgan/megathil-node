import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science Engineering' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'CSE' })
  @IsString()
  readonly abbreviation: string;

  @ApiProperty({ example: 'Engineering degree on Computer Science' })
  readonly shortDescription: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}