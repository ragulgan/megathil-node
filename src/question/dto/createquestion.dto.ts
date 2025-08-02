import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class CreateQuestionDto {
  readonly questionId: string;

  @ApiProperty({ example: '6631e563e06e20821e223e57' })
  readonly moduleId: string;

  @ApiProperty({ example: '663315b497cecc903959f215' })
  readonly questionType: string;

  @ApiProperty({ example: '66334ee6057f2d737f7f0c58' })
  readonly templateType: string;

  @ApiProperty({ example: 'What is your favorite color?' })
  readonly questionTitle: string;

  @ApiProperty({ example: '66334ee6057f2d737f7f0c58' })
  readonly parentQuestionId: string;

  @ApiProperty({ example: '66334ee6057f2d737f7f0c58' })
  readonly parentOptionId: string;

  @ApiProperty({ example: true })
  readonly isParent: boolean;

  @ApiProperty({ example: false })
  readonly hasChildrens: boolean;

  @ApiProperty({ example: "1" })
  readonly displayOrder: string;

  @ApiProperty({ example: 1 })
  readonly contentOrder: number;

  @ApiProperty({
    example: ['Option 1', 'Option 2', 'Option 3'],
    description: 'Array of hint text options',
  })
  hintText: string[];

  @ApiProperty({
    example: ['6631e4326e3fb44f43786d34.jpg', '6631e4326e3fb44f43786d34.jpg'],
    description: 'Array of paths to hint images',
  })
  hintImage: string[];

  @ApiProperty({
    example: '6631e4326e3fb44f43786d34.jpg',
  })
  questionImage: string;

  @ApiProperty({
    example: '6631e4326e3fb44f43786d34.jpg',
  })
  readonly imageQuestionAllGenders: string;

  @ApiProperty({
    example: '6631e4326e3fb44f43786d34.jpg',
  })
  readonly imageQuestionFemale: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  readonly hasMultiAnswers: boolean;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  gems: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  xpId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  megathilPoints: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}
