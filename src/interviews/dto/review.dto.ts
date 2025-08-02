import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReviewDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '6643078d2a08932bc5ac8e51',
    required: true
  })
  readonly interviewerId: string;
  
  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Interview ID' })
  @IsString()
  readonly bookingId: string;

  @ApiProperty({ example: '4' })
  @IsNumber()
  readonly rating: number;

  @ApiProperty({ example: 'Good in fluencly but need to improve the vocabulary.' })
  @IsString()
  readonly review: string;
}