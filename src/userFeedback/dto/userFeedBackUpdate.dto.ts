import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateFeedBackDto {
  @ApiProperty({ example: 'Example title'})
  @IsString()
  readonly title: string;

  @ApiProperty({ example: 'Example comment text' })
  @IsString()
  readonly comments: string;
}
