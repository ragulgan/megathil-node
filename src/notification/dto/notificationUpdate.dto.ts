import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ example: 'READ/UNREAD'})
  @IsString()
  readonly viewed: string;
}