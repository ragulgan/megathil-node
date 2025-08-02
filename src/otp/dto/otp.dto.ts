import { ApiProperty } from '@nestjs/swagger';
import {
  
} from 'class-validator';

export class CreateUserDto { 
 
  @ApiProperty({ 
    example: 'delisa',
    required: false })
  readonly firstName: string;

 
  @ApiProperty({ 
    example: 'nivash',
    required: false })
  readonly lastName: string;
 
  @ApiProperty({ 
    example: 'admin@gmail.com',
    required: false })
  readonly email: string;

  readonly mobileNumber: string;
  readonly type: string;

 
  @ApiProperty({ 
    example: '31/07/2000',
    required: false })
  readonly education: string;

 
  @ApiProperty({ 
    example: '07/2000',
    required: false })
  readonly yearOfPassing: string;

  readonly status: string;

  readonly createdBy: string;

  readonly updatedBy: string;
  
  
  }