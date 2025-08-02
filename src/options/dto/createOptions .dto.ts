import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { Status } from '../options.schema'

export class CreateOptionsDto {
  @ApiProperty({ example: '66334fe66d1507999eca2f9b' })
  @IsString()
  readonly questionId: string;

  @ApiProperty({ example: 'Option title' })
  readonly optionTitle: string;

  @ApiProperty({ example: 'Option Value 1' })
  readonly optionValue: string;

  @ApiProperty({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
  readonly optionImage: string;

  @ApiProperty({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
  readonly imageOptionFemale: string;

  @ApiProperty({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
  readonly imageOptionAllGenders: string;

  @ApiProperty({ example: 'Option 1' })
  readonly optionText: string;

  @ApiProperty({ example: '#B94229', description: 'Color option for display' })
  optionColour: string;

  @ApiProperty({ example: '1', description: 'Order of display' })
  displayOrder: string;

  @ApiProperty({ example: 'Tip Title' })
  tipTitle: string;

  @ApiProperty({ example: 'Appropriate Description' })
  appropriateDesc: string;

  @ApiProperty({ example: 'Inappropriate Description' })
  inappropriateDesc: string;

  @ApiProperty({ example: "true" })
  validOption: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  gems: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  xpId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  megathilPoints: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  readonly status: string;
}
