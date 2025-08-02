import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from './question.schema';
import { CreateQuestionDto } from './dto/createquestion.dto';
import { UpdatedQuestionDto } from './dto/updateQuestion.dto';
import * as _ from 'lodash';
import { Modules } from 'src/module/module.schema';
const mongoose = require('mongoose');

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Modules.name) private ModuleModel: Model<Modules>,
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
  ) { }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    try {
      const createdQuestion = new this.QuestionModel(createQuestionDto);
      const data = await createdQuestion.save();
      await this.QuestionModel.findOneAndUpdate({ _id: data._id }, { questionId: data._id }).exec();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving Question.");
    }
  }

  async findAllQuestionsByModuleId(queryParams: any, moduleId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;
    const moduleObjectId = new ObjectId(moduleId);
    const match: any = { status: 'ACTIVE', moduleId: moduleObjectId };
    if (queryParams.status) {
      match.status = queryParams.status
    }
    if (queryParams.questionTitle) {
      match.questionTitle = new RegExp(`${queryParams.questionTitle}`, 'i')
    }
    if (queryParams.questionType) {
      match.questionType = new ObjectId(queryParams.questionType)
    }

    const questionsList = await this.QuestionModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "questiontypes",
          localField: "questionType",
          foreignField: "_id",
          as: "questionType",
        },
      },
      {
        $unwind: { path: "$questionType", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "templatetypes",
          localField: "templateType",
          foreignField: "_id",
          as: "templateType",
        },
      },
      {
        $unwind: { path: "$templateType", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          questionId: "$_id",
          questionTitle: 1,
          templateType: {
            id: "$templateType._id",
            displayName: "$templateType.displayName"
          },
          questionType: {
            id: "$questionType._id",
            displayName: "$questionType.displayName"
          },
          displayOrder: { $toInt: '$displayOrder' },
          contentOrder: 1,
          parentQuestionId: 1,
          parentOptionId: 1,
          questionImage: 1,
          imageQuestionFemale: 1,
          imageQuestionAllGenders: 1,
          hasMultiAnswers: 1,
          moduleId: 1,
          status: 1
        }
      },
      {
        $sort: { displayOrder: 1 },
      },
      { $skip: skipValue },
      { $limit: parsedLimit },
    ]);

    const count = await this.QuestionModel.countDocuments(match).exec();
    const module = await this.ModuleModel.findOne({ _id: moduleId })
      .select("moduleId moduleName bgColor imageUrl status unitId")
      .populate('unitId', 'unitId unitName bgColor imageUrl status');
    return { questionsList, module, count };
  }

  async findAllByModule(queryParams: any, moduleId: string, decodedToken: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const moduleObjectId = new ObjectId(moduleId);
    const currentQuestionId = new ObjectId(queryParams.parentQuestionId);
    const userId = new ObjectId(decodedToken.id);
    const match: any = { status: 'ACTIVE', isParent: true, moduleId: moduleObjectId }
    if (queryParams.parentOptionId) {
      match.parentOptionId = queryParams.parentOptionId;
      match.isParent = false;
    }
    try {
      const scenarios = ["S1", "S2", "S3"];
      const Scenario = await this.QuestionModel.aggregate([
        {
          $match: match
        },
        {
          $lookup: {
            from: 'modules',
            localField: 'moduleId',
            foreignField: '_id',
            as: 'module'
          }
        },
        {
          $lookup: {
            from: 'questiontypes',
            localField: 'questionType',
            foreignField: '_id',
            as: 'questionType'
          }
        },
        {
          $project: {
            status: 1,
            linkScenario: 1,
            module: { $arrayElemAt: ["$module", 0] },
            questionType: { $arrayElemAt: ["$questionType", 0] }
          }
        },
        {
          $group: {
            _id: null,
            ...scenarios.reduce((acc, scenario) => {
              acc[`scenario${scenario}Count`] = {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "ACTIVE"] },
                        { $eq: ["$linkScenario", scenario] },
                        { $eq: ["$module.isScenario", true] },
                        { $eq: ["$questionType.displayName", "Questions"] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              };
              return acc;
            }, {})
          }
        }
      ]);

      const scenarioCounts = Scenario.length > 0 ? Scenario[0] : {};

      const QuestionList = await this.QuestionModel.aggregate([
        {
          $match: match,
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "options",
            localField: "_id",
            foreignField: "questionId",
            pipeline: [
              {
                $match: {
                  status: "ACTIVE",
                },
              },
              {
                $lookup: {
                  from: "experiencepoints",
                  localField: "xpId",
                  foreignField: "_id",
                  as: "xp",
                },
              },
              {
                $unwind: { path: "$xp", preserveNullAndEmptyArrays: true },
              },
              {
                $sort: { displayOrder: 1 },
              },
            ],
            as: "options",
          },
        },
        {
          $lookup: {
            from: "userprogressstatuses",
            let: { moduleId: moduleObjectId, userId: userId, parentOptionId: queryParams.parentOptionId },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$moduleId", "$moduleId"] },
                      { $eq: ["$$userId", "$userId"] },
                      { $eq: ["$parentOptionId", "$parentOptionId"] },
                    ],
                  },
                },
              },
              {
                $sort: { createdAt: -1 },
              },
              {
                $limit: 1,
              },
              {
                $addFields: {
                  scenarioCounts: scenarioCounts,
                }
              },
            ],
            as: "userModuleStatus",
          },
        },
        {
          $unwind: { path: "$userModuleStatus", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "questiontypes",
            localField: "questionType",
            foreignField: "_id",
            as: "questionType",
          },
        },
        {
          $unwind: { path: "$questionType", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "templatetypes",
            localField: "templateType",
            foreignField: "_id",
            as: "templateType",
          },
        },
        {
          $unwind: { path: "$templateType", preserveNullAndEmptyArrays: true },
        },
        {
          $match: { status: "ACTIVE" },
        },
        {
          $project: {
            _id: 0,
            questionId: "$_id",
            moduleId: "$moduleId",
            questionTitle: 1,
            hasMultiAnswers: 1,
            displayOrder: { $toInt: "$displayOrder" },
            contentOrder: 1,
            status: 1,
            hintText: 1,
            hintImage: 1,
            questionImage: 1,
            imageQuestionFemale: 1,
            imageQuestionAllGenders: 1,
            isParent: 1,
            hasChildrens: 1,
            linkScenario: 1,
            templateType: {
              id: "$templateType._id",
              displayName: "$templateType.displayName",
              displayValue: "$templateType.displayValue",
              status: "$templateType.status",
            },
            questionType: {
              id: "$questionType._id",
              displayName: "$questionType.displayName",
              displayValue: "$questionType.displayValue",
              status: "$questionType.status",
            },
            userModuleStatus: "$userModuleStatus",
            options: {
              $map: {
                input: "$options",
                as: "option",
                in: {
                  id: "$$option._id",
                  optionTitle: "$$option.optionTitle",
                  optionValue: "$$option.optionValue",
                  optionText: "$$option.optionText",
                  optionImage: "$$option.optionImage",
                  imageOptionFemale: "$$option.imageOptionFemale",
                  imageOptionAllGenders: "$$option.imageOptionAllGenders",
                  optionColour: "$$option.optionColour",
                  validOption: "$$option.validOption",
                  tipTitle: "$$option.tipTitle",
                  appropriateDesc: "$$option.appropriateDesc",
                  inappropriateDesc: "$$option.inappropriateDesc",
                  status: "$$option.status",
                  xp: "$$option.xp",
                  displayOrder: { $toInt: "$$option.displayOrder" },
                },
              },
            },
          },
        },
        {
          $addFields: {
            options: {
              $sortArray: {
                input: "$options",
                sortBy: { displayOrder: 1 }
              }
            }
          }
        },
        {
          $sort: { displayOrder: 1 },
        },
      ]).exec();
      const count = await this.QuestionModel.countDocuments(match).exec()
      return { QuestionList, count }
    } catch (error) {
      console.error(`Error fetching units with modules: ${error.message}`);
      return {}
    }
  }


  async findAll(queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status
    }
    if (queryParams.questionTitle) {
      match.questionTitle = new RegExp(`${queryParams.questionTitle}`, 'i')
    }
    if (queryParams.questionType) {
      match.questionType = new ObjectId(queryParams.questionType)
    }
    try {
      const QuestionList = await this.QuestionModel.aggregate([
        {
          $match: match,
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skipValue,
        },
        {
          $limit: parsedLimit,
        },
        {
          $lookup: {
            from: "options",
            localField: "_id",
            foreignField: "questionId",
            as: "options"
          }
        },
        {
          $lookup: {
            from: "questiontypes",
            localField: "questionType",
            foreignField: "_id",
            as: "questionType"
          }
        },
        {
          $unwind: {
            path: "$questionType",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "templatetypes",
            localField: "templateType",
            foreignField: "_id",
            as: "templateType"
          }
        },
        {
          $unwind: {
            path: "$templateType",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            status: "ACTIVE"
          }
        },
        {
          $addFields: {
            options: {
              $filter: {
                input: "$options",
                as: "option",
                cond: { $eq: ["$$option.status", "ACTIVE"] }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            questionId: "$_id",
            moduleId: "$moduleId",
            questionTitle: 1,
            hasMultiAnswers: 1,
            displayOrder: { $toInt: "$displayOrder" },
            status: 1,
            hintText: 1,
            hintImage: 1,
            linkScenario: 1,
            templateType: {
              id: "$templateType._id",
              displayName: "$templateType.displayName",
              displayValue: "$templateType.displayValue",
              status: "$templateType.status"
            },
            questionType: {
              id: "$questionType._id",
              displayName: "$questionType.displayName",
              displayValue: "$questionType.displayValue",
              status: "$questionType.status"
            },
            options: {
              $map: {
                input: "$options",
                as: "option",
                in: {
                  id: "$$option._id",
                  optionValue: "$$option.optionValue",
                  optionText: "$$option.optionText",
                  optionImage: "$$option.optionImage",
                  imageOptionFemale: "$$option.imageOptionFemale",
                  imageOptionAllGenders: "$$option.imageOptionAllGenders",
                  validOption: "$$option.validOption",
                  status: "$$option.status",
                  displayOrder: 1,
                }
              }
            }
          }
        },
        {
          $sort: { displayOrder: 1 }
        }
      ]);
      const count = await this.QuestionModel.countDocuments(match).exec()
      return { QuestionList, count }
    } catch (error) {
      console.error(`Error fetching units with modules: ${error.message}`);
      return {}
    }
  }

  async findByEmail(email: string): Promise<Question | null> {
    const Question = await this.QuestionModel.findOne({ email }).exec();
    return Question || null;
  }

  async gethasMultiAnswers(id: string) {
    return await this.QuestionModel.findOne({ _id: id, hasMultiAnswers: false }).exec();
  }

  async getById(id: string): Promise<Question> {
    return await this.QuestionModel.findOne({ _id: id })
      .populate('gems', 'id name value')
      .populate('xpId', 'id name value')
      .populate('megathilPoints', 'id name value')
      .populate('questionType', 'id displayName displayValue')
      .populate('templateType', 'id displayName displayValue')
  }

  async findByIdQuestionDetail(id: string): Promise<Question> {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const questionId = new ObjectId(id);
      const questionDetailDataId = await this.QuestionModel.aggregate([
        {
          $match: {
            _id: questionId
          }
        },
        {
          $lookup: {
            from: "gems",
            localField: "gems",
            foreignField: "_id",
            as: "gems"
          }
        },
        {
          $unwind: {
            path: "$gems",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "experiencepoints",
            localField: "xpId",
            foreignField: "_id",
            as: "xpId"
          }
        },
        {
          $unwind: {
            path: "$xpId",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "megathilpoints",
            localField: "megathilPoints",
            foreignField: "_id",
            as: "megathilPoints"
          }
        },
        {
          $unwind: {
            path: "$megathilPoints",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "questiontypes",
            localField: "questionType",
            foreignField: "_id",
            as: "questionType"
          }
        },
        {
          $unwind: {
            path: "$questionType",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "templatetypes",
            localField: "templateType",
            foreignField: "_id",
            as: "templateType"
          }
        },
        {
          $unwind: {
            path: "$templateType",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            parentQuestionId: {
              $cond: {
                if: { $eq: ["$parentQuestionId", ""] },
                then: null,
                else: { $toObjectId: "$parentQuestionId" }
              }
            }
          }
        },
        {
          $lookup: {
            from: "questions",
            localField: "parentQuestionId",
            foreignField: "_id",
            as: "parentQuestionId"
          }
        },
        {
          $unwind: {
            path: "$parentQuestionId",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            parentOptionId: {
              $cond: {
                if: { $eq: ["$parentOptionId", ""] },
                then: null,
                else: { $toObjectId: "$parentOptionId" }
              }
            }
          }
        },
        {
          $lookup: {
            from: "options",
            localField: "parentOptionId",
            foreignField: "_id",
            as: "parentOptionId"
          }
        },
        {
          $unwind: {
            path: "$parentOptionId",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            questionId: "$_id",
            questionTitle: 1,
            displayOrder: 1,
            contentOrder: 1,
            questionImage: 1,
            imageQuestionFemale: 1,
            linkScenario: 1,
            isParent: 1,
            hasChildrens: 1,
            hintText: 1,
            hintImage: 1,
            imageQuestionAllGenders: 1,
            hasMultiAnswers: 1,
            status: 1,
            moduleId: "$moduleId",
            gems: {
              id: "$gems._id",
              name: "$gems.name",
              value: "$gems.value"
            },
            xpId: {
              id: "$xpId._id",
              name: "$xpId.name",
              value: "$xpId.value"
            },
            megathilPoints: {
              id: "$megathilPoints._id",
              name: "$megathilPoints.name",
              value: "$megathilPoints.value"
            },
            questionType: {
              id: "$questionType._id",
              displayName: "$questionType.displayName",
              displayValue: "$questionType.displayValue"
            },
            templateType: {
              id: "$templateType._id",
              displayName: "$templateType.displayName",
              displayValue: "$templateType.displayValue"
            },
            parentQuestionId: {
              id: "$parentQuestionId._id",
              questionTitle: "$parentQuestionId.questionTitle",
            },
            parentOptionId: {
              id: "$parentOptionId._id",
              optionValue: "$parentOptionId.optionValue",
              optionText: "$parentOptionId.optionText"
            }
          }
        }
      ]).exec();
      if (questionDetailDataId.length > 0) {
        return questionDetailDataId[0]
      } else {
        return null
      }
    } catch (error) {
      return null;
    }
  }

  async findById(id: string): Promise<Question> {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const questionId = new ObjectId(id);
      const questionDataId = await this.QuestionModel.aggregate([
        {
          $match: {
            _id: questionId
          }
        },
        {
          $lookup: {
            from: "options",
            localField: "_id",
            foreignField: "questionId",
            as: "options"
          }
        },
        {
          $lookup: {
            from: "questiontypes",
            localField: "questionType",
            foreignField: "_id",
            as: "questionType"
          }
        },
        {
          $unwind: {
            path: "$questionType",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "templatetypes",
            localField: "templateType",
            foreignField: "_id",
            as: "templateType"
          }
        },
        {
          $unwind: {
            path: "$templateType",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            status: "ACTIVE"
          }
        },
        {
          $addFields: {
            options: {
              $filter: {
                input: "$options",
                as: "option",
                cond: { $eq: ["$$option.status", "ACTIVE"] }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            questionId: "$_id",
            moduleId: "$moduleId",
            questionTitle: 1,
            questionImage: 1,
            imageQuestionFemale: 1,
            imageQuestionAllGenders: 1,
            hasMultiAnswers: 1,
            isParent: 1,
            hasChildrens: 1,
            displayOrder: 1,
            contentOrder: 1,
            parentQuestionId: 1,
            parentOptionId: 1,
            status: 1,
            hintText: 1,
            hintImage: 1,
            linkScenario: 1,
            templateType: {
              id: "$templateType._id",
              displayName: "$templateType.displayName",
              displayValue: "$templateType.displayValue",
              status: "$templateType.status"
            },
            questionType: {
              id: "$questionType._id",
              displayName: "$questionType.displayName",
              displayValue: "$questionType.displayValue",
              status: "$questionType.status"
            },
            options: {
              $map: {
                input: "$options",
                as: "option",
                in: {
                  id: "$$option._id",
                  optionValue: "$$option.optionValue",
                  optionText: "$$option.optionText",
                  optionImage: "$$option.optionImage",
                  imageOptionFemale: "$$option.imageOptionFemale",
                  imageOptionAllGenders: "$$option.imageOptionAllGenders",
                  validOption: "$$option.validOption",
                  status: "$$option.status"
                }
              }
            }
          }
        }
      ]).exec();
      if (questionDataId.length > 0) {
        return questionDataId[0]
      } else {
        return null
      }
    } catch (error) {
      return null;
    }

  }


  async update(id: string, updatedQuestionDto: UpdatedQuestionDto): Promise<Question> {
    return this.QuestionModel.findOneAndUpdate({ _id: id }, updatedQuestionDto).exec();
  }


  async delete(id: string): Promise<Question> {
    const deletedQuestion = await this.QuestionModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedQuestion
  }

}