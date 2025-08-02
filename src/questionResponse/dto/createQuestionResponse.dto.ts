import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateQuestionResponseDto {

  @ApiProperty({ example: '6631e4326e3fb44f43786d31' })
  userProgressStatusId: string;

  @ApiProperty({ example: '6631e4326e3fb44f43786d3f' })
  @IsString()
  readonly unitId: string;

  @ApiProperty({ example: '6634c4e96fb4b0e09bb152c9' })
  @IsString()
  readonly moduleId: string;

  @ApiProperty({ example: '66334fe66d1507999eca2f9b' })
  readonly questionId: string;

  @ApiProperty({ example: '66334fe66d1507999eca2f9b' })
  readonly parentOptionId: string;

  @ApiProperty({ example: ['66337243078cdeef0c68ba70', '663372c197da03ab6d864053'] })
  readonly answers: string[];
}