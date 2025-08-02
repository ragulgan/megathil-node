import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Options } from './options.schema';
import { CreateOptionsDto } from './dto/createOptions .dto';
import { UpdatedOptionsDto } from './dto/updateOptions .dto';
import * as _ from 'lodash';
import { Question } from 'src/question/question.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class OptionsService {
  constructor(
    @InjectModel(Options.name) private OptionsModel: Model<Options>,
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
  ) { }

  async create(createOptionsDto: CreateOptionsDto): Promise<Options> {
    try {
      const createdOptions = new this.OptionsModel(createOptionsDto);
      const data = await createdOptions.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving Options.");
    }
  }

  async findAllOptionsForQuestionId(queryParams: any, questionId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;
    const questionObjectId = new ObjectId(questionId);
    const match: any = { status: 'ACTIVE', questionId: questionObjectId };
    if (queryParams.status) {
      match.status = queryParams.status
    }
    if (queryParams.optionText) {
      match.optionText = new RegExp(`${queryParams.optionText}`, 'i')
    }

    const options = await this.OptionsModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'experiencepoints',
          localField: 'xpId',
          foreignField: '_id',
          as: 'xp'
        }
      },
      {
        $unwind: { path: "$xp", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          optionTitle: 1,
          optionValue: 1,
          optionText: 1,
          optionImage: 1,
          imageOptionFemale: 1,
          imageOptionAllGenders: 1,
          optionColour: 1,
          displayOrder: { $toInt: '$displayOrder' },
          validOption: 1,
          tipTitle: 1,
          appropriateDesc: 1,
          inappropriateDesc: 1,
          questionId: 1,
          gems: 1,
          xp: {
            id: "$xp._id",
            name: "$xp.name",
            value: "$xp.value"
          },
          megathilPoints: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      },
      { $sort: { displayOrder: 1 } },
      { $skip: skipValue },
      { $limit: parsedLimit },
    ]);

    const count = await this.OptionsModel.countDocuments(match).exec();
    const question = await this.QuestionModel.findOne({ _id: questionId })
      .select('questionId questionTitle')
      .populate({ path: 'moduleId', select: 'moduleId moduleName', populate: { path: 'unitId', select: 'unitId unitName' } }).exec();
    return { options, question, count }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    if (queryParams.optionText) {
      match.optionText = new RegExp(`${queryParams.optionText}`, 'i')
    }
    const OptionsList = await this.OptionsModel
      .find(match)
      .populate('gems', 'id name value')
      .populate('xpId', 'id name value')
      .populate('megathilPoints', 'id name value')
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .exec();
    const count = await this.OptionsModel.countDocuments(match).exec()
    return { OptionsList, count };
  }

  async findByEmail(email: string): Promise<Options | null> {
    const Options = await this.OptionsModel.findOne({ email }).exec();
    return Options || null;
  }


  async findById(id: string): Promise<Options> {
    return this.OptionsModel.findOne({ _id: id })
      .populate('gems', 'id name value')
      .populate('xpId', 'id name value')
      .populate('megathilPoints', 'id name value')
      .exec();
  }

  async update(id: string, updatedOptionsDto: UpdatedOptionsDto): Promise<Options> {
    return this.OptionsModel.findOneAndUpdate({ _id: id }, updatedOptionsDto).exec();
  }


  async delete(id: string): Promise<Options> {
    const deletedOptions = await this.OptionsModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedOptions
  }

}
