import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CompleteDto {
  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Interview ID' })
  @IsString()
  readonly bookingId: string;

  @ApiProperty({ example: '75' })
  @IsNumber()
  readonly fluency: number;

  @ApiProperty({ example: 'LOW/MEDIUM/HIGH' })
  @IsString()
  readonly engery: string;

  @ApiProperty({ example: '75' })
  @IsNumber()
  readonly speechRate: number;

  @ApiProperty({ example: '75' })
  @IsNumber()
  readonly vocabulary: number;

  @ApiProperty({ example: '75' })
  @IsNumber()
  readonly contentRelevance: number;

  @ApiProperty({ example: 'Good in fluencly but need to improve the vocabulary.' })
  @IsString()
  readonly interviewerComments: string;
}