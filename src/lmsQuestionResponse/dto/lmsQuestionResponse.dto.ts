import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLMSQuestionResponseDto {
  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'test level should be a string' })
  @IsOptional()
  testTimingTaken: string;

  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'test level should be a string' })
  @IsOptional()
  questionTimingTaken: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'topicId should not be empty' })
  topicId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'sub topicId should not be empty' })
  subTopicId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'sub topic1Id should not be empty' })
  subTopic1Id: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'test level id should not be empty' })
  testLevelId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'questionId should not be empty' })
  questionId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'optionId should not be empty' })
  optionId: string;

  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'test level should be a string' })
  @IsOptional()
  workSpace: string;

  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'essay score should be a string' })
  @IsOptional()
  essayScore: any;
}