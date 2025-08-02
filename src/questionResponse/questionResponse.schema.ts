import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class QuestionResponse {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Modules' })
  moduleId: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question' })
  questionId: string

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Options' }])
  answers: MongooseSchema.Types.ObjectId[];

  @Prop()
  parentOptionId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'userLearningHistory' })
  userLearningHistoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'userProgressStatus' })
  userProgressStatusId: MongooseSchema.Types.ObjectId;

  @Prop()
  yourScore: Number;

  @Prop()
  maxScore: Number;

  @Prop()
  speechRate: Number;

  @Prop()
  attempt: Number

  @Prop()
  contentRelevanceRating: Number;

  @Prop()
  contentRelevanceRatingReason: string;

  @Prop({
    type: {
      label: String,
      score: Number,
    },
  })
  emotionRecognition: {
    label: string;
    score: number;
  };

  @Prop()
  enhancedText: string;
  
  @Prop({
    type: {
      label: String,
      score: Number,
    },
  })
  fluencyLevel: {
    label: string;
    score: number;
  };
  @Prop({
    type: {
      text: { type: String }
    }
  })
  transcription: {
    text: string;
  };

  @Prop()
  vocabularyRating: Number;

  @Prop()
  vocabularyRatingReason: string;

  @Prop()
  questionsCount: Number;

}


export const QuestionResponseSchema = SchemaFactory.createForClass(QuestionResponse)

QuestionResponseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})
