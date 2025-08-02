import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Question {

  @Prop()
  questionId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TemplateType' })
  templateType: string;

  @Prop()
  questionTitle: string;

  @Prop()
  displayOrder: string;

  @Prop()
  contentOrder: number;

  @Prop()
  questionImage: string;

  @Prop()
  imageQuestionFemale: string;
  
  @Prop()
  imageQuestionAllGenders: string;  

  @Prop()
  parentQuestionId: string;

  @Prop()
  parentOptionId: string;

  @Prop({ default: true })
  isParent: boolean;

  @Prop({ default: false })
  hasChildrens: boolean;

  @Prop()
  linkScenario: string;

  @Prop()
  hintText: Array<any>

  @Prop()
  hintImage: Array<any>

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'QuestionType' })
  questionType: string;

  @Prop()
  hasMultiAnswers: boolean;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Modules' })
  moduleId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Gems' })
  gems: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ExperiencePoints' })
  xpId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MegathilPoints' })
  megathilPoints: MongooseSchema.Types.ObjectId;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
