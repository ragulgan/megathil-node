import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionType } from './questionType.schema';
import { CreateQuestionTypeDto } from './dto/createQuestionType.dto';
import { UpdatedQuestionTypeDto } from './dto/updateQuestionType.dto';
import * as _ from 'lodash';

@Injectable()
export class QuestionTypeService {
  constructor(
    @InjectModel(QuestionType.name) private QuestionTypeModel: Model<QuestionType>,
  ) { }

  async create(createQuestionTypeDto: CreateQuestionTypeDto): Promise<QuestionType> {
    try {
      const createdQuestionType = new this.QuestionTypeModel(createQuestionTypeDto);
      const data = await createdQuestionType.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving QuestionType.");
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    let match: any = { status: 'ACTIVE' }

    if (queryParams.name) {
      const orCondition = []
      orCondition.push({
        displayValue: new RegExp(`${queryParams.name}`, 'i')
      }, {
        displayName: new RegExp(`${queryParams.name}`, 'i')
      });
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }
    const QuestionTypeList = await this.QuestionTypeModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.QuestionTypeModel.countDocuments(match).exec()
    return { QuestionTypeList, count };
  }

  async findByDisplayName(displayName: string, displayValue: string): Promise<QuestionType | null> {
    return await this.QuestionTypeModel.findOne({ $or: [{ displayValue: displayValue }, { displayName: displayName }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByDisplayNameButId(displayName: string, displayValue: string, id: string): Promise<QuestionType | null> {
    return await this.QuestionTypeModel.findOne({ $or: [{ displayValue: displayValue }, { displayName: displayName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<QuestionType> {
    return this.QuestionTypeModel.findById(id).exec();
  }


  async update(id: string, updatedQuestionTypeDto: UpdatedQuestionTypeDto): Promise<QuestionType> {
    return this.QuestionTypeModel.findOneAndUpdate({ _id: id }, updatedQuestionTypeDto).exec();
  }


  async delete(id: string): Promise<QuestionType> {
    const deletedQuestionType = await this.QuestionTypeModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedQuestionType
  }

}
