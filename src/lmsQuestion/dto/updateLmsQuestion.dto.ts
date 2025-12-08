import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateLMSQuestionDto {
  questionlId: string;

  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'test level should be a string' })
  @IsNotEmpty({ message: 'test level should not be empty' })
  lmsQuestion: string;

  @ApiProperty({ example: "1" })
  @IsString({ message: 'test level displayOrder should be a string' })
  @IsOptional()
  displayOrder: string;

  @ApiProperty({ example: "18 mins" })
  @IsString({ message: 'test level time should be a string' })
  @IsOptional()
  questionTiming: string;

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

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'test level id should not be empty' })
  testLevelId: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'MCQ Image URL' })
  @IsString({ message: 'MCQ imageUrl should be a string' })
  @IsOptional()
  mcqImageUrl: string;

  @ApiProperty({ example: "#include <stdio.h>\n#include <math.h>\n\nint main() {\n    printf(\"fmod of 3.14/2.1 is %lf\\n\", fmod(3.14, 2.1));\n    return 0;\n}", description: 'mcq programming code' })
  @IsString({ message: 'mcq programming code should be a string' })
  @IsOptional()
  mcqProgramming: string;
}