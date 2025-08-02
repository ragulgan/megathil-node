
import { Status } from '../questionType.schema'
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedQuestionTypeDto {
  @ApiProperty({ example: 'multipleChoice' })
  @IsString()
  readonly displayName: string;

  @ApiProperty({ example: 'dragAndDrop' })
  @IsString()
  readonly displayValue: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  readonly status: string;
}