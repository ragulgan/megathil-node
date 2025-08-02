import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class ProcessAudioDto {
  @ApiProperty({ example: '6631e4326e3fb44f43786d31' })
  @IsString()
  readonly aiToken: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  readonly userId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d31' })
  @IsString()
  readonly userProgressStatusId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  readonly unitId: string;

  @ApiProperty({ example: '6634c4e96fb4b0e09bb152c9' })
  @IsString()
  readonly moduleId: string;

  @ApiProperty({ example: '66334fe66d1507999eca2f9b' })
  @IsString()
  readonly questionId: string;

  @ApiProperty({ type: Object })
  @IsObject()
  readonly aiResponseData: any;
}