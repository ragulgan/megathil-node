import { ApiProperty } from '@nestjs/swagger';

export class StaffChangepasswordDto {

  @ApiProperty({ example: 'Test@123' })
  readonly currentPassword: string;

  @ApiProperty({ example: 'Test123' })
  readonly newPassword: string;
}


export class StaffForgotPasswordDto {

  @ApiProperty({ example: 'ajith@gmail.com' })
  readonly email: string;

  @ApiProperty({ example: '8825662022' })
  readonly mobileNumber: string;
}

export class StaffResetPasswordDto {

  @ApiProperty({ example: 'ajith@gmail.com' })
  readonly email: string;

  @ApiProperty({ example: '8825662022' })
  readonly mobileNumber: string;

  @ApiProperty({ example: '1234' })
  readonly otp: string;

  @ApiProperty({ example: 'test@123' })
  readonly newPassword: string;
}
