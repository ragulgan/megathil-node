import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordDto {
  @ApiProperty({
    example: 'Test@123',
    required: true,
  })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  readonly currentPassword: string;

  @ApiProperty({
    example: 'New@123',
    required: true,
  })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  readonly newPassword: string;

}