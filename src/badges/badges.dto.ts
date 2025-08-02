import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BadgesDto {
  @ApiProperty({ example: 'Daily Achievement Badge' })
  @IsNotEmpty({ message: 'Badge name is required.' })
  @IsString({ message: 'Badge name is required.' })
  readonly name: string;

  @ApiProperty({ example: 'imageid.jpg' })
  @IsNotEmpty({ message: 'Image url is required.' })
  @IsString({ message: 'Image url is required.' })
  readonly imageUrl: string;

  @ApiProperty({ example: 'This badge provided when user achieved daily target.' })
  @IsNotEmpty({ message: 'Short note is required.' })
  @IsString({ message: 'Short note is required.' })
  readonly shortNote: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}
