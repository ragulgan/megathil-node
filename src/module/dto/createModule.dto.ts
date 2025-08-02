import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateModuleDto {
  moduleId: string;

  @ApiProperty({ example: 'Module Name', description: 'Name of the module' })
  @IsString()
  moduleName: string;

  @ApiProperty({ example: '#FFFFFF', description: 'Background color' })
  @IsString()
  bgColor: string;

  @ApiProperty({ example: 'http://example.com/image.png', description: 'URL of the image' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  unitId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  @IsString()
  gems: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  @IsString()
  xpId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d34' })
  @IsString()
  megathilPoints: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the module' })
  status: string;

  @ApiProperty({ example: '6634c1037820719fabb8811b', description: 'Type of the module' })
  @IsString()
  moduleType: string;

  @ApiProperty({ example: "1" })
  readonly displayOrder: string;

  @ApiProperty({ example: false })
  readonly isGenderSpecific: boolean;

  @ApiProperty({ example: '66334ee6057f2d737f7f0c58', description: 'Template type of the module' })
  @IsString()
  templateType: string;
}
