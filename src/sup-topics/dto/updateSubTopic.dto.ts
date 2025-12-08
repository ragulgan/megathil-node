import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateSubTopicsDto {
  subTopicId: string;

  @ApiProperty({ example: 'Sub Topic Name', description: 'Name of the sub topic' })
  @IsString({ message: 'sub topicName should be a string' })
  @IsNotEmpty({ message: 'sub topicName should not be empty' })
  subTopicName: string;

  @ApiProperty({ example: 'Quantitative Aptitude topics from my list (Number System, Percentages, Time & Work, etc).', description: 'sub topic description' })
  @IsString({ message: 'sub description should be a string' })
  @IsNotEmpty({ message: 'sub description should not be empty' })
  description: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL' })
  @IsString({ message: 'sub imageUrl should be a string' })
  @IsNotEmpty({ message: 'sub imageUrl should not be empty' })
  imageUrl: string;

  @ApiProperty({ example: "1" })
  @IsString({ message: 'sub displayOrder should be a string' })
  @IsOptional()
  displayOrder: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the sub topic' })
  @IsString({ message: 'sub status should be a string' })
  @IsNotEmpty({ message: 'sub status should not be empty' })
  status: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'topicId should not be empty' })
  topicId: string;
}