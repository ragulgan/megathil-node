import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { Status } from '../questionType.schema'

export class CreateQuestionTypeDto {
  @ApiProperty({ example: 'multipleChoice' })
  @IsString()
  readonly displayName: string;

  @ApiProperty({ example: 'dragAndDrop' })
  @IsString()
  readonly displayValue: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  readonly status: string;
}
