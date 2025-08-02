import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { userLearningHistory } from './userUnitHistory.schema';
import * as _ from 'lodash';
const mongoose = require('mongoose');

@Injectable()
export class userUnitHistoryService {
  constructor(
    @InjectModel(userLearningHistory.name) private userUnitHistoryModel: Model<userLearningHistory>,
  ) { }

  async findAll(queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status
    }
    try {
      const userUnitHistoryList = await this.userUnitHistoryModel.aggregate([
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
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'units',
            localField: 'unitId',
            foreignField: '_id',
            as: 'unit',
          },
        },
        { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'modules',
            localField: 'moduleId',
            foreignField: '_id',
            as: 'module',
          },
        },
        { $unwind: { path: '$module', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'questions',
            localField: 'questionId',
            foreignField: '_id',
            as: 'question',
          },
        },
        { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'options',
            let: { answerIds: '$userAnswers' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$answerIds'] },
                },
              },
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  optionValue: 1,
                  optionText: 1,
                },
              },
            ],
            as: 'userAnswers',
          },
        },
        {
          $lookup: {
            from: 'templateTypes',
            localField: 'question.templateType',
            foreignField: '_id',
            as: 'templateType',
          },
        },
        { $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'questionTypes',
            localField: 'question.questionType',
            foreignField: '_id',
            as: 'questionType',
          },
        },
        { $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            id: '$_id',
            createdAt: 1,
            updatedAt: 1,
            user: {
              id: '$user._id',
              email: '$user.email',
              mobileNumber: '$user.mobileNumber',
              education: '$user.education',
              status: '$user.status',
            },
            unit: {
              unitId: '$unit._id',
              unitName: '$unit.unitName',
              bgColor: '$unit.bgColor',
              imageUrl: '$unit.imageUrl',
              unlocked: '$unit.unlocked',
              status: '$unit.status',
              modules: '$unit.modules',
            },
            module: {
              moduleId: '$module._id',
              moduleName: '$module.moduleName',
              bgColor: '$module.bgColor',
              imageUrl: '$module.imageUrl',
              status: '$module.status',
            },
            question: {
              id: '$question._id',
              questionId: '$question._id',
              templateType: '$templateType',
              questionTitle: '$question.questionTitle',
              questionType: '$questionType',
              hasMultiAnswers: '$question.hasMultiAnswers',
              status: '$question.status',
            },
            userAnswers: 1,
            templateType: '$templateType',
            questionType: '$questionType',
          },
        },
      ]).exec();

      const count = await this.userUnitHistoryModel.countDocuments(match).exec()
      return { userUnitHistoryList, count }
    } catch (error) {
      console.error(`Error fetching units with modules: ${error.message}`);
      return {}
    }
  }

  async findUserUnitHistory(userId: string, queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const match: any = {
      status: 'ACTIVE',
      userId: userObjectId
    }

    if (queryParams.status) {
      match.status = queryParams.status
    }
    const userUnitHistoryList = await this.userUnitHistoryModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $skip: skipValue,
      },
      {
        $limit: parsedLimit,
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit',
        },
      },
      { $unwind: { path: '$unit', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'modules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module',
        },
      },
      { $unwind: { path: '$module', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'questions',
          let: { questionId: '$questionId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$questionId'] } } },
            {
              $lookup: {
                from: 'questiontypes',
                localField: 'questionType',
                foreignField: '_id',
                as: 'questionType'
              }
            },
            {
              $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true }
            },
            {
              $project: {
                _id: 1,
                questionTitle: 1,
                questionType: {
                  id: '$questionType._id',
                  displayName: '$questionType.displayName'
                }
              }
            }
          ],
          as: 'question'
        },
      },
      { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'questionresponses',
          let: {
            userId: '$userId',
            unitId: '$unitId',
            moduleId: '$moduleId',
            questionId: '$questionId',
            attempt: '$attempt',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$unitId', '$$unitId'] },
                    { $eq: ['$moduleId', '$$moduleId'] },
                    { $eq: ['$questionId', '$$questionId'] },
                    { $eq: ['$attempt', '$$attempt'] },
                  ],
                },
              },
            },
            {
              $addFields: {
                userView: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: [{ $ifNull: ['$contentRelevanceRating', null] }, null] },
                        { $ne: [{ $ifNull: ['$contentRelevanceRatingReason', null] }, null] },
                        { $ne: [{ $ifNull: ['$emotionRecognition', null] }, null] },
                        { $ne: [{ $ifNull: ['$fluencyLevel', null] }, null] },
                        { $ne: [{ $ifNull: ['$transcription', null] }, null] },
                        { $ne: [{ $ifNull: ['$vocabularyRating', null] }, null] },
                        { $ne: [{ $ifNull: ['$vocabularyRatingReason', null] }, null] },
                      ],
                    },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $group: {
                _id: '$questionId',
                userView: { $first: '$userView' },
              },
            },
          ],
          as: 'questionResponse',
        },
      },
      {
        $unwind: {
          path: '$questionResponse',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          createdAt: 1,
          updatedAt: 1,
          unit: {
            unitId: '$unit._id',
            unitName: 1,
          },
          module: {
            moduleId: '$module._id',
            moduleName: 1,
          },
          question: {
            id: "$question._id",
            questionTitle: "$question.questionTitle",
            questionType: "$question.questionType"
          },
          questionResponse: {
            userView: '$questionResponse.userView'
          },
          score: 1,
          attempt: 1,
          userId: 1
        },
      },
    ]);

    const count = await this.userUnitHistoryModel.countDocuments(match).exec();
    return { userUnitHistoryList, count };
  }

}
