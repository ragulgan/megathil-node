import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { Status } from '../templateType.schema'

export class CreateTemplateTypeDto {
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
