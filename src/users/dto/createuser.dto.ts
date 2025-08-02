import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsMobilePhone, IsDateString, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {

  @ApiProperty({ example: 'STU0001' })
  readonly studentId: string;

  @ApiProperty({ example: 'delisa' })
  @IsNotEmpty({ message: 'First name must not be empty' })
  readonly firstName: string;

  @ApiProperty({ example: 'nivash' })
  @IsNotEmpty({ message: 'Last name must not be empty' })
  readonly lastName: string;

  @ApiProperty({ example: '2005-05-09T09:52:38Z' })
  // @IsDateString({}, { message: 'Date of birth must be a valid date string eg:2005-05-09T09:52:38Z' })
  dob: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: string;

  @ApiProperty({ example: 'naveen' })
  fatherName: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ example: '+91' })
  mobileCode: string;

  @ApiProperty({ example: '8825662022' })
  @IsNotEmpty({ message: 'Mobile number must not be empty' })
  readonly mobileNumber: string;

  @ApiProperty({ example: '8825662021' })
  alternativeMobileNumber: string;

  @ApiProperty({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
  readonly profileImage: string;

  @ApiProperty({ example: '2024-05-09T09:52:38Z', description: 'Month of passing the education' })
  readonly monthAndYearOfPassingOut: Date;

  @ApiProperty({ example: '123/Sample address.' })
  currentAddress: string;

  @ApiProperty({ example: '663b5d30a8b23b5f0b848681', description: 'Country ID associated with the user' })
  readonly country: string;

  @ApiProperty({ example: '663b641b40ca563372bdea86', description: 'State ID associated with the user' })
  readonly state: string;

  @ApiProperty({ example: '663b6c3c6cc583f51d66bab1', description: 'City ID associated with the user' })
  readonly city: string;

  @ApiProperty({ example: '603002', description: 'Year of passing the education' })
  readonly postalCode: string;

  @ApiProperty({ example: '6639d814e00d110fc099900b', description: 'Course ID associated with the user' })
  readonly course: string;

  @ApiProperty({ example: '6639defb56ea064cebbf198c', description: 'Department ID associated with the user' })
  readonly department: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'College ID associated with the user' })
  readonly college: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Institute ID' })
  @IsOptional()
  readonly instituteId: string;

  @ApiProperty({ example: 'Brand new college' })
  otherCollegeName: string;

  @ApiProperty({ example: 'Brand new department' })
  otherDepartmentName: string;

  @ApiProperty({ example: 'Brand new course' })
  otherCourseName: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Staff ID associated with the user' })
  staff: string;

  readonly deviceId: string;

  @ApiProperty({ example: 'Taken Internchips at AWS' })
  internship: string;

  @ApiProperty({ example: 'Working in an industry that you’re passionate about' })
  jobAspiration: string;

  @ApiProperty({ example: 'BASIC or PREMIUM' })
  readonly userType: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;

  readonly createdBy: string;

  readonly updatedBy: string;
}

export class BulkUploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsNotEmpty()
  file: any;

  @ApiProperty({ example: 'BASIC or PREMIUM' })
  @IsNotEmpty()
  readonly userType?: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'College ID associated with the user', required: false })
  @IsOptional()
  readonly collegeId?: string;
}