import * as mongoose from 'mongoose';
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class UserProgressStatusDto {
  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  unitId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  moduleId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  currentQuestionId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  parentOptionId: string;

  @IsNumber()
  completedInstructionsCount: number;

  @IsNumber()
  totalInstructionsCount: number;

  @IsNumber()
  completedQuestionsCount: number;

  @IsNumber()
  totalQuestionsCount: number;

  @IsNumber()
  completedPercentage: number;

  @IsNumber()
  completedCount: number;

  @IsNumber()
  totalCount: number;

  instructionIds: string[];

  questionIds: string[];

  completedInstructionIds: string[];

  completedQuestionIds: string[];

  @IsEnum(['NOT_STARTED', 'INPROGRESS', 'COMPLETED'])
  status: string;
}