import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, IsUrl, MinLength, IsEnum } from 'class-validator';
import { Gender } from '../interviewer.schema';

export class UpdatedInterviewerDto {

  @ApiProperty({ example: 'Ajith' })
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Kumar' })
  readonly lastName: string;

  @ApiProperty({ example: 'ajith@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: '8825662022' })
  @IsPhoneNumber('IN', { message: 'Invalid mobile number' })
  @IsNotEmpty()
  readonly mobileNumber: string;

  @ApiProperty({ example: 'ajith@123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;

  @ApiProperty({ example: 'Master\'s Degree' })
  readonly qualification: string;

  @ApiProperty({ example: '4' })
  readonly experience: number;

  @ApiProperty({ example: 'Tech Corp' })
  readonly organization: string;

  @ApiProperty({ example: 'imagename.jpg' })
  readonly organizationLogo: string;

  @ApiProperty({ example: 'MALE' })
  @IsEnum(Gender, { message: 'Invalid gender. Gender should be MALE, FEMALE, or OTHER' })
  readonly gender: string;

  @ApiProperty({ example: 'path/to/profile-image.jpg' })
  readonly profileImage: string;

  @ApiProperty({ example: 'I am a software engineer with 10 years of experience.' })
  readonly aboutMe: string;

  @ApiProperty({ example: 'https://mywebsite.com' })
  // @IsUrl({}, { message: 'Invalid URL format' })
  readonly website: string;

  @ApiProperty({ example: 'https://www.linkedin.com/in/Ajith' })
  // @IsUrl({}, { message: 'Invalid URL format' })
  readonly linkedInProfileUrl: string;

  @ApiProperty({ example: 'https://twitter.com/Ajith' })
  // @IsUrl({}, { message: 'Invalid URL format' })
  readonly twitterProfileUrl: string;

  @ApiProperty({ example: 'https://www.facebook.com/Ajith' })
  // @IsUrl({}, { message: 'Invalid URL format' })
  readonly fbProfileUrl: string;

  @ApiProperty({ example: 'https://www.youtube.com/channel/Ajith' })
  // @IsUrl({}, { message: 'Invalid URL format' })
  readonly youtubeProfileUrl: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}
