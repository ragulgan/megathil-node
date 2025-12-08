import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateTopicsDto {
  topicId: string;

  @ApiProperty({ example: 'Topic Name', description: 'Name of the topic' })
  @IsString({ message: 'topicName should be a string' })
  @IsNotEmpty({ message: 'topicName should not be empty' })
  topicName: string;

  @ApiProperty({ example: 'Quantitative Aptitude topics from my list (Number System, Percentages, Time & Work, etc).', description: 'topic description' })
  @IsString({ message: 'description should be a string' })
  @IsNotEmpty({ message: 'description should not be empty' })
  description: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL' })
  @IsString({ message: 'imageUrl should be a string' })
  @IsNotEmpty({ message: 'imageUrl should not be empty' })
  imageUrl: string;

  @ApiProperty({ example: "1" })
  @IsString({ message: 'displayOrder should be a string' })
  @IsOptional()
  displayOrder: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the topic' })
  @IsString({ message: 'status should be a string' })
  @IsNotEmpty({ message: 'status should not be empty' })
  status: string;

  @ApiProperty({ example: 'GENERAL', description: 'Source of the topic' })
  @IsString({ message: 'Source should be a string' })
  @IsNotEmpty({ message: 'Source should not be empty' })
  topicSource: string;

  @ApiProperty({ example: '50' })
  @IsOptional()
  price: number;
}
