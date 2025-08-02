import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class ApplyDto {
  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Interview ID' })
  @IsString()
  readonly availabilityId: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89f', description: 'Booking ID if reschedule flow.' })
  readonly bookingId: string;

  @ApiProperty({ example: '2024-06-09T09:52:38Z' })
  @IsDateString()
  readonly startDateTime: Date;

  @ApiProperty({ example: '2024-07-09T09:52:38Z' })
  @IsDateString()
  readonly endDateTime: Date;
}