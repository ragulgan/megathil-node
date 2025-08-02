import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class NotificationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'APA91bFoi3lMMre9G3XzR1LrF4ZT82_15MsMdEICogXSLB8-MrdkRuRQFwNI5u8Dh0cI90ABD3BOKnxkEla8cGdisbDHl5cVIkZah5QUhSAxzx4Roa7b4xy9tvx9iNSYw-eXBYYd8k1XKf8Q_Qq1X9-x-U-Y79vdPq', required: false })
  readonly deviceToken: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Notification title goes here', required: false })
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Notification message goes here', required: false })
  readonly body: string;
}