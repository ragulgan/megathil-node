import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePromotorDto {
  @ApiProperty({ example: 'Gopi' })
  @IsNotEmpty({ message: 'firstName must not be empty' })
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Sudhakar' })
  @IsNotEmpty({ message: 'lastName must not be empty' })
  @IsString()
  readonly lastName: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
    
  @ApiProperty({ example: '8825662022' })
  @IsOptional()
  @Matches(/^(?:\+1\d{9,15}|\d{9,15}|(?:\+91|91)\d{10})$/, {
      message: 'Invalid mobile number.',
    })
  mobileNumber?: string;

  @ApiProperty({ example: 'GopiSudha2025' })
  @IsNotEmpty({ message: 'promo code must not be empty' })
  @IsString()
  readonly promotedCode: string;

  @ApiProperty()
  @IsOptional()
  profileImage?: string;
  
  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}
