import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    example: 'ADMIN',
    required: false })
  readonly role: string;

  @ApiProperty({ 
    example: 'Admin',
    required: false })
  readonly displayName: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;

  readonly createdBy: string;

  readonly updatedBy: string;
  }