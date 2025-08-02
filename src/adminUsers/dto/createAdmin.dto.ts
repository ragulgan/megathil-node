import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsMongoId, MinLength, IsNotEmpty } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'Ajith',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'firstName should be a string' })
  @IsNotEmpty({ message: 'firstName should not be empty' })
  readonly firstName: string;

  @ApiProperty({
    example: 'Kumar',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'lastName should be a string' })
  @IsNotEmpty({ message: 'lastName should not be empty' })
  readonly lastName: string;

  @ApiProperty({
    example: 'admin@gmail.com',
    required: true,
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  readonly email: string;

  @ApiProperty({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
  readonly profileImage: string;

  @ApiProperty({
    example: 'Test@123',
    required: true,
  })
  @IsString({ message: 'password should be a string' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'password should not be empty' })
  password: string;

  @ApiProperty({
    example: '8825662022',
    required: true,
  })
  readonly mobileNumber: string;

  @ApiProperty({
    example: '6629263d3b9953ad1309e7fc',
    required: true,
  })
  @IsMongoId({ message: 'role must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'role should not be empty' })
  readonly role: string;

  @ApiProperty({
    example: 'ACTIVE',
    required: true
  })
  @IsString({ message: 'status should be a string' })
  @IsNotEmpty({ message: 'status should not be empty' })
  readonly status: string;
}
