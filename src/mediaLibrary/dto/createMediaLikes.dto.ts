import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMediaLikesDto {

  @ApiProperty({ example: '662f6ca192cd0a870085d705' })
  @IsString()
  mediaId: string;

  @ApiProperty({ example: '664c4831eb12db738f138f1c' })
  @IsString()
  userId: string;
}
