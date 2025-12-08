import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'test@gmail.com',
    required: false
  })
  readonly email: string;

  @ApiProperty({
    example: '+91',
    required: false
  })
  readonly mobileCode: string;

  @ApiProperty({
    example: '8825662022',
    required: false
  })
  readonly mobileNumber: string;

  @ApiProperty({
    example: 'abcdef123456',
    required: false,
    description: 'Unique identifier for the device'
  })
  readonly deviceId: string;

  @ApiProperty({
    example: 'android',
    required: false,
    description: 'android/ios'
  })
  readonly device: string;

}

export class OtpDto {
  @ApiProperty({
    example: 'test@gmail.com',
    required: false
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '1234',
    required: true
  })
  readonly otp: string;

  @ApiProperty({
    example: '+91',
    required: false
  })
  readonly mobileCode: string;
  
  @ApiProperty({
    example: '8825662022',
    required: false
  })
  readonly mobileNumber: string;

  @ApiProperty({
    example: 'abcdef123456',
    required: false,
    description: 'Unique identifier for the device'
  })
  readonly deviceId: string;

  @ApiProperty({
    example: 'android',
    required: false,
    description: 'android/ios'
  })
  readonly device: string;

  @ApiProperty({
    example: 'APA91bFoi3lMMre9G3XzR1LrF4ZT82_15MsMdEICogXSLB8-MrdkRuRQFwNI5u8Dh0cI90ABD3BOKnxkEla8cGdisbDHl5cVIkZah5QUhSAxzx4Roa7b4xy9tvx9iNSYw-eXBYYd8k1XKf8Q_Qq1X9-x-U-Y79vdPq',
    required: false,
    description: 'Device token for push notification'
  })
  readonly deviceToken: string;

  @ApiProperty({
    example: 'Iphone 16',
    required: false,
    description: 'Device detail'
  })
  readonly deviceInfo: string;

  @ApiProperty({
    example: 'Test123',
    required: false
  })
  @IsOptional()
  readonly promotedCode: string;
}

export class InitiateDto {
  @ApiProperty({
    example: 'abcdef123456',
    required: false,
    description: 'Unique identifier for the device'
  })
  readonly deviceId: string;

  @ApiProperty({
    example: 'android',
    required: false,
    description: 'android/ios'
  })
  readonly device: string;

  @ApiProperty({
    example: 'APA91bFoi3lMMre9G3XzR1LrF4ZT82_15MsMdEICogXSLB8-MrdkRuRQFwNI5u8Dh0cI90ABD3BOKnxkEla8cGdisbDHl5cVIkZah5QUhSAxzx4Roa7b4xy9tvx9iNSYw-eXBYYd8k1XKf8Q_Qq1X9-x-U-Y79vdPq',
    required: false,
    description: 'Device token for push notification'
  })
  readonly deviceToken: string;

  @ApiProperty({
    example: 'Iphone 16',
    required: false,
    description: 'Device detail'
  })
  readonly deviceInfo: string;
}

export class AdminDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'ajithkumar.shenll@gmail.com',
    required: false
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Test@123',
    required: false
  })
  readonly password: string;
}

export class StaffLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'teststaffone@gmail.com',
    required: true
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Test@123',
    required: true
  })
  readonly password: string;
}

export class InterviewerLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'ajithkumar@gmail.com',
    required: true
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'ajith@123',
    required: true
  })
  readonly password: string;
}

export class AdminChangePasswordStaffDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '6648767230da52e1464b1122',
    required: true
  })
  readonly staffId: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'ajith@123',
    required: true
  })
  readonly newPassword: string;
}

export class AdminChangePasswordInterviewerDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '6643078d2a08932bc5ac8e51',
    required: true
  })
  readonly interviewerId: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'ajith@123',
    required: true
  })
  readonly newPassword: string;
}

export class CreateAdminDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'ajithkumar.shenll@gmail.com',
    required: true
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Test@123',
    required: true
  })
  readonly password: string;
}

export class SuperAdminChangePasswordDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '662a033786eeaaaf4b7830f7',
    required: true
  })
  readonly adminId: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'ajith@123',
    required: true
  })
  readonly newPassword: string;
}

export class PromotorLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'teststaffone@gmail.com',
    required: true
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Test@123',
    required: true
  })
  readonly password: string;
}

export class SignUpDto {

  @ApiProperty({ example: 'delisa' })
  @IsNotEmpty({ message: 'First name must not be empty' })
  firstName: string;

  @ApiProperty({ example: 'nivash' })
  @IsNotEmpty({ message: 'Last name must not be empty' })
  lastName: string;

  @ApiProperty({
    example: 'test@gmail.com',
    required: false
  })
  email: string;

  @ApiProperty({
    example: '+91',
    required: false
  })
  mobileCode: string;

  @ApiProperty({
    example: '8825662022',
    required: false
  })
  mobileNumber: string;

  @ApiProperty({ example: '2005-05-09T09:52:38Z' })
  dob: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: string;

}