import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsDateString, IsEnum, IsPhoneNumber, Matches } from 'class-validator';
import { Gender } from '../staff.schema';

export class CreateStaffDto {

  @ApiProperty({ example: 'Ajith' })
  readonly firstName: string;

  @ApiProperty({ example: 'Kumar' })
  readonly lastName: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ example: 'Test@123' })
  @IsString()
  password: string;

  @ApiProperty({ example: '8825662022' })
  @IsPhoneNumber('IN', { message: 'Invalid mobile number' })
  readonly mobileNumber: string;

  @ApiProperty({ example: '2011-05-14T10:06:31Z' })
  readonly dateOfBirth: string;

  @ApiProperty({ example: '645645-34535345-34534534.jpg' })
  readonly profileImage: string;

  @ApiProperty({ example: 'MALE' })
  @IsEnum(Gender, { message: 'Invalid gender. Gender should be MALE, FEMALE, NOT_SPECIFIED' })
  readonly gender: string;

  @ApiProperty({ example: 'SRM0340012' })
  @IsString()
  readonly staffId: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'College ID associated with the user' })
  readonly college: string;

  @ApiProperty({ example: '6639defb56ea064cebbf198c', description: 'Department ID associated with the user' })
  readonly department: string;

  @ApiProperty({ example: 'STAFF' })
  role: string;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty({ message: 'Status should not be empty' })
  readonly status: string;
}
