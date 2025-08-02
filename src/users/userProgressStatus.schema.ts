import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'typeorm';
import * as mongoose from 'mongoose';

// this schema holds the status and completion percentage
@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
@Entity({ name: 'userProgressStatus' })
export class UserProgressStatus {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' })
  unitId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Modules' })
  moduleId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Question' })
  currentQuestionId: mongoose.Schema.Types.ObjectId;

  @Prop()
  instructionIds: string[];

  @Prop()
  questionIds: string[];

  @Prop()
  completedInstructionIds: string[];

  @Prop()
  completedQuestionIds: string[];

  @Prop()
  parentOptionId: string;

  @Prop()
  completedInstructionsCount: number;

  @Prop()
  totalInstructionsCount: number;

  @Prop()
  completedQuestionsCount: number;

  @Prop()
  totalQuestionsCount: number;

  @Prop()
  completedPercentage: number;

  @Prop()
  completedCount: number;

  @Prop()
  totalCount: number;

  @Prop({ enum: ['NOT_STARTED', 'INPROGRESS', 'COMPLETED'], default: 'NOT_STARTED' })
  status: string;

}

export const UserProgressStatusSchema = SchemaFactory.createForClass(UserProgressStatus);


UserProgressStatusSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});