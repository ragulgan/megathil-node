import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export class CarouselDto {
  @ApiProperty({ example: 'Gem 50' })
  readonly title: string;

  @ApiProperty({ example: 'Gem 50 with this you can get 50 gems for 75 RS.' })
  readonly note: string;


  @ApiProperty({ example: '645645-34535345-34534534.jpg' })
  imageUrl: string;


  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly displayOrder: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  readonly percentage: number;

  @ApiProperty({ example: '13-09-2024' })
  readonly validStartDate: Date;

  @ApiProperty({ example: '14-09-2024' })
  readonly validEndDate: Date;

  @ApiProperty({
    example: 'ACTIVE',
    enum: Status,
    description: 'The status of the carousel'
  })
  @IsEnum(Status)
  readonly status: Status;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'College ID' })
  @IsOptional()
  readonly college: string;

  @ApiProperty({ example: '6639d0b1c328bf3fe52af89e', description: 'Promotor ID' })
  @IsOptional()
  readonly promotorId: string;
}