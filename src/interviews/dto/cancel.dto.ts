import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelDto {
  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Interview ID' })
  @IsString()
  readonly bookingId: string;

  @ApiProperty({ example: 'Cancelling due to internet outage.' })
  @IsString()
  readonly reason: string;
}