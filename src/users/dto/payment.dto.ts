import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaymentDto {
  @ApiProperty({ example: "'TEST' or 'LIVE'" })
  @IsString({ message: "Status must be ''TEST' or 'LIVE'" })
  mode: string;

  @ApiProperty({ example: "'RAZORPAY' or 'INAPPPURCHASE'" })
  @IsOptional()
  @IsString({ message: "Status must be 'RAZORPAY' or 'INAPPPURCHASE'" })
  paymentMethod?: string;

  @ApiProperty({ example: "'UNIT' or 'INTERVIEW'" })
  @IsOptional()
  @IsString({ message: "Status must be 'UNIT' or 'INTERVIEW'" })
  paymentFor?: string;

  @ApiProperty({ example: "'SUCCESS', 'FAILED', 'CANCELLED' or 'PENDING'" })
  @IsString({ message: "Status must be 'SUCCESS', 'FAILED', 'CANCELLED' or 'PENDING'" })
  status: string;

  @ApiProperty({ example: 'Response from the payment gateway.' })
  paymentBody: any;
}