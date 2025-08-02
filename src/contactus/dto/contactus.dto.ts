import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ContactUsDto {

  @ApiProperty({ example: 'Siddharth Abhimanyu' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'siddharth.abhimanyu@gmail.com' })
  @IsString()
  readonly email: string;

  @ApiProperty({ example: '+91 9944266522' })
  @IsString()
  readonly mobileNumber: string;

  @ApiProperty({ example: 'I am interested in your business idea. Can we talk if you have time.' })
  @IsString()
  readonly message: string;

  status: string;
}