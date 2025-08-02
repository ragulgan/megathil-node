import { ApiProperty } from '@nestjs/swagger';

export class UserAwardGemsDto {
  @ApiProperty({ example: '663de1484059f8ab73dd0eaa' })
  userId: string;
  @ApiProperty({ example: '66a3743e1cd6d337401e5621' })
  gemId: string;
}