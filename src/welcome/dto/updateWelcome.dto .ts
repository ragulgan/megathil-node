import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdatedWelcomeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'image-url.jpg',
    required: false,
  })
  readonly image: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Lorem ipsum dolor sit amet',
    required: false,
  })
  readonly content: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'image-url.jpg',
    required: false,
  })
  readonly bgImage: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Welcome to My Website',
    required: false,
  })
  readonly title: string;

  readonly status: string;

  readonly createdBy: string;

  readonly updatedBy: string;

}