import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateUnitDto {
  unitId: string;

  @ApiProperty({ example: 'Unit Name', description: 'Name of the unit' })
  @Prop()
  unitName: string;

  @ApiProperty({ example: '#FFFFFF', description: 'Background color' })
  @Prop()
  bgColor: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL' })
  @Prop()
  imageUrl: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  gems: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  xpId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  megathilPoints: string;

  @ApiProperty({ example: "1" })
  readonly displayOrder: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  readonly   unlockCostInGems: number;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the unit' })
  @Prop()
  status: string;
}
