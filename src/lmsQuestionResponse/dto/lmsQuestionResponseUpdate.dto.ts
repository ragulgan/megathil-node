import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateLMSQuestionResponseDto {
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

  @ApiProperty({ example: 'COMPLETED' })
  @IsOptional()
  status: string;

}