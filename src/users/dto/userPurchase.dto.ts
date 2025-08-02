import { ApiProperty } from '@nestjs/swagger';

export class UserPurchaseDto {
  @ApiProperty({ example: '66681103f2b14082f7b0618e' })
  gemsPackageId: string;
}