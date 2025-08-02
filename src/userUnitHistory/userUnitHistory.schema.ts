import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class userLearningHistory {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Unit' })
  unitId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Modules' })
  moduleId: MongooseSchema.Types.ObjectId

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question' })
  questionId: string

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Options' }])
  // @Prop([{ type: MongooseSchema.Types.Mixed}])
  userAnswers: MongooseSchema.Types.ObjectId[];

  @Prop()
  filePath: string

  @Prop()
  score: number

  @Prop()
  attempt: number

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: string

}

export const userLearningHistorySchema = SchemaFactory.createForClass(userLearningHistory)

userLearningHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})
