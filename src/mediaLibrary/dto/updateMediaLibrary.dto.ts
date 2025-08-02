import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedMediaLibraryDto {
  @ApiProperty({ example: 'Tech Giants Announce Collaboration for Climate Change Solutions' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg' })
  @IsString()
  titleImage: string;

  @ApiProperty({ example: 'AUDIO' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'Job Information' })
  category: string;

  @ApiProperty({ example: 'Reasonable description here.' })
  description: string;

  @ApiProperty({ example: 'Relevant summary here' })
  summary: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;

  @ApiProperty({ example: 'PUBLISHED' })
  readonly libraryStatus: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'College ID associated with the user' })
  collegeId: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Staff ID associated with the user' })
  staffId: string;
}
