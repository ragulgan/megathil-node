import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ADMIN',
    required: false
  })
  readonly role: string;

  @ApiProperty({
    example: 'Admin',
    required: false
  })
  readonly displayName: string;

  @Prop({ enum: Status, default: Status.ACTIVE })
  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;

  readonly createdBy: string;

  readonly updatedBy: string;

}