import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateLangDto {

  @ApiProperty({ example: 'EN' })
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  readonly name: string;

  // @ApiProperty({ example: '8825662022' })
  // readonly code: string;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty({ message: 'Status should not be empty' })
  readonly status: string;
}
