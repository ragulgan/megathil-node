import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class AcceptDto {
  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Interview ID' })
  @IsString()
  readonly bookingId: string;

  @ApiProperty({ example: 'https://meet.google.com/asu-euha-bxf' })
  @IsUrl()
  readonly meetingLink: string;

  @ApiProperty({ example: 'Self introduction and personality guidance' })
  @IsString()
  readonly interviewNote: string;
}