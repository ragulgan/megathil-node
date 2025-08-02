
import { Status } from '../templateType.schema'
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedTemplateTypeDto {
  readonly TemplateTypeId: string;
  @ApiProperty({ example: 'Sitecore templates' })
  @IsString()
  readonly displayName: string;

  @ApiProperty({ example: 'Certificate' })
  @IsString()
  readonly displayValue: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  readonly status: string;
}