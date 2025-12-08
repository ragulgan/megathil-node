import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateTestLevelDto {
  testLevelId: string;

  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'test level should be a string' })
  @IsNotEmpty({ message: 'test level should not be empty' })
  testLevel: string;

  @ApiProperty({ example: 'Quantitative Aptitude topics from my list (Number System, Percentages, Time & Work, etc).', description: 'sub topic description' })
  @IsString({ message: 'test level description should be a string' })
  description: string;

  @ApiProperty({ example: "1" })
  @IsString({ message: 'test level displayOrder should be a string' })
  @IsOptional()
  displayOrder: string;

  @ApiProperty({ example: "18 mins" })
  @IsString({ message: 'test level time should be a string' })
  testTiming: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the test level' })
  @IsString({ message: 'test level status should be a string' })
  @IsNotEmpty({ message: 'test level status should not be empty' })
  status: string;

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

  @ApiProperty({ example: 'MCQ/MCQIMAGE/MCQPROGRAMMING/ESSAY', description: 'question type of the test level' })
  @IsString({ message: 'test level question type should be a string' })
  @IsNotEmpty({ message: 'test level question type should not be empty' })
  lmsQuestionType: string;
}