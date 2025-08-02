import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TrophiesDto {
  @ApiProperty({ example: 'Become' })
  @IsString()
  name: string;

  @ApiProperty({ example: '4534543-4534543-4534543.jpg' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 'Tropy for becoming a member.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  status: string;

}