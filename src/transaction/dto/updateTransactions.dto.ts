import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

export class UpdateTransactionDto {
  @ApiProperty({ example: 'Gems' })
  @IsString()
  readonly item: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  readonly quantity: number;

  @ApiProperty({ example: '664c9d3f232a418a40021ae2', type: String })
  @IsString()
  readonly userId: string;

  @ApiProperty({ example: 'REF123456' })
  @IsString()
  readonly refNumber: string;

  @ApiProperty({ example: 'Paid via credit card' })
  @IsString()
  readonly payment: string;

  @ApiProperty({ example: 'Purchase of office supplies' })
  @IsString()
  @IsOptional()
  readonly reason?: string;

  @ApiProperty({ 
    example: 'PENDING', 
    enum: PaymentStatus, 
    default: 'PENDING',
    description: 'The status of the payment' 
  })
  @IsEnum(PaymentStatus)
  readonly status: PaymentStatus;
}
