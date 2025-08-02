import { ApiProperty } from '@nestjs/swagger';
import {

} from 'class-validator';

export class CreateWelcomeDto {
  
  @ApiProperty({
    example: 'image-url.jpg',
    required: false,
  })
  readonly image: string;

  @ApiProperty({
    example: 'image-url.jpg',
    required: false,
  })
  readonly bgImage: string;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit amet',
    required: false,
  })
  readonly content: string;

  @ApiProperty({
    example: 'Welcome to My Website',
    required: false,
  })
  readonly title: string;

  readonly status: string;

  readonly createdBy: string;

  readonly updatedBy: string;

}