import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLMSOptionDto {
  lmsOptionId: string;

  @ApiProperty({ example: 'Test Level-101', description: 'Test Level' })
  @IsString({ message: 'test level should be a string' })
  @IsOptional()
  lmsOption: string;

  @ApiProperty({ example: "1" })
  @IsString({ message: 'test level displayOrder should be a string' })
  @IsOptional()
  displayOrder: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the test level' })
  @IsString({ message: 'test level status should be a string' })
  @IsNotEmpty({ message: 'test level status should not be empty' })
  status: string;

  @ApiProperty({ example: false })
  @IsOptional()
  validOption: boolean;

  @ApiProperty({ example: "explanation of the answer" })
  @IsString({ message: 'explanation should be a string' })
  @IsOptional()
  explanation: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  @IsNotEmpty({ message: 'questionId should not be empty' })
  questionId: string;

  @ApiProperty({ example: 'Essay Prograph', description: 'Answer Essay Prograph' })
  @IsString({ message: 'answer essay prograph should be a string' })
  @IsOptional()
  essayAnswer: string;
}