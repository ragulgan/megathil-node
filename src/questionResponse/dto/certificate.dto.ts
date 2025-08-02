import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsOptional, IsEmail, IsDateString, IsNumber } from 'class-validator';

export class CertificateAttributesDTO {
  @ApiProperty({ example: 'TT6677' })
  @IsString()
  'Certificate ID': string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  dice_display_name: string;

  @ApiProperty({ example: '20-Sep-2026' })
  @IsDateString()
  'Valid Till': string;

  @ApiProperty({ example: 'HTML' })
  @IsString()
  'Skill Name': string;

  @ApiProperty({ example: 'RRTTYYP' })
  @IsString()
  Name: string;

  @ApiProperty({ example: '13-Sep-2024' })
  @IsDateString()
  'Issued On': string;

  @ApiProperty({ example: '5' })
  @IsString()
  Score: string;

  @ApiProperty({ example: 'Level 3' })
  @IsString()
  'Cert Level': string;

  @ApiProperty({ example: 'yu67uy67' })
  @IsString()
  'User ID': string;

  @ApiProperty({ example: 'JeevithaM' })
  @IsString()
  'Issued By': string;

  @ApiProperty({ example: 'jeevithaperumal@gmail.com' })
  @IsEmail()
  Email: string;

  @ApiProperty({ example: '+918667602239' })
  @IsString()
  Phone: string;
}

export class EmailDTO {
  @ApiProperty({ example: 'jeevithaperumal@gmail.com' })
  @IsEmail()
  invitee_email: string;

  @ApiProperty({ example: '07b323d8-0b46-4824-889b-91afd431e9b5' })
  @IsString()
  email_template_id: string;
}

export class CertificateDTO {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_cert_required: boolean;

  @ApiProperty({ example: 'Schema 1' })
  @IsString()
  schema_name: string;

  @ApiProperty({ example: '1.0' })
  @IsString()
  schema_version: string;

  @ApiProperty({ example: ['email'] })
  @IsArray()
  invite_modes: string[];

  @ApiProperty({ example: 'RRTTYY' })
  @IsString()
  invitee_name: string;

  @ApiProperty({ type: EmailDTO })
  email: EmailDTO;

  @ApiProperty({ example: '07b323d8-0b46-4824-889b-91afd431e9b5' })
  @IsString()
  template_id: string;

  @ApiProperty({ type: CertificateAttributesDTO })
  attributes: CertificateAttributesDTO;
}
