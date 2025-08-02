import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Modules } from './module.schema';
import { CreateModuleDto } from './dto/createModule.dto';
import { UpdatedModuleDto } from './dto/updateModule.dto ';
import * as _ from 'lodash';
import { Unit } from 'src/unit/unit.schema';
const mongoose = require('mongoose');

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    @InjectModel(Modules.name) private ModuleModel: Model<Modules>,
  ) { }

  async create(createModuleDto: CreateModuleDto): Promise<Modules> {
    try {
      const createdQuestion = new this.ModuleModel(createModuleDto);
      const data = await createdQuestion.save();
      await this.ModuleModel.findOneAndUpdate({ _id: data._id }, { moduleId: data._id }).exec();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving Module.");
    }
  }

  async findMinimalByUnitId(queryParams: any, unitId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;
    const unitObjectId = new ObjectId(unitId);
    const match: any = { status: 'ACTIVE', unitId: unitObjectId };
    if (queryParams.status) {
      match.status = queryParams.status;
    }

    const moduleList = await this.ModuleModel.aggregate([
      { $match: match },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unitId',
        },
      },
      { $unwind: { path: '$unitId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'moduletypes',
          localField: 'moduleType',
          foreignField: '_id',
          as: 'moduleType',
        },
      },
      { $unwind: { path: '$moduleType', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'templatetypes',
          localField: 'templateType',
          foreignField: '_id',
          as: 'templateType',
        },
      },
      { $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'experiencepoints',
          localField: 'xpId',
          foreignField: '_id',
          as: 'xp',
        },
      },
      { $unwind: { path: '$xp', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'gems',
          localField: 'gems',
          foreignField: '_id',
          as: 'gems',
        },
      },
      { $unwind: { path: '$gems', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'megathilpoints',
          localField: 'megathilPoints',
          foreignField: '_id',
          as: 'megathilPoints',
        },
      },
      { $unwind: { path: '$megathilPoints', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          moduleId: '$_id',
          moduleName: 1,
          bgColor: 1,
          imageUrl: 1,
          status: 1,
          moduleType: {
            displayName: '$moduleType.displayName',
            displayValue: '$moduleType.displayValue',
          },
          templateType: {
            displayName: '$templateType.displayName',
            displayValue: '$templateType.displayValue',
          },
          unitId: {
            id: '$unitId._id',
            unitName: '$unitId.unitName',
          },
          gems: {
            _id: '$gems._id',
            name: '$gems.name',
            value: '$gems.value',
          },
          xp: {
            id: '$xp._id',
            name: '$xp.name',
            value: '$xp.value',
          },
          megathilPoints: {
            _id: '$megathilPoints._id',
            name: '$megathilPoints.name',
            value: '$megathilPoints.value',
          },
          displayOrder: { $toInt: '$displayOrder' },
        },
      },
      {
        $sort: { displayOrder: 1 },
      },
    ]);
    const count = await this.ModuleModel.countDocuments(match).exec();
    const unit = await this.unitModel.findOne({ _id: unitId }).select("unitId unitName bgColor imageUrl status");
    return { moduleList, count, unit }
  }

  async findAll(queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status
    }
    try {

      const ModuleList = await this.ModuleModel.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: skipValue },
        { $limit: parsedLimit },
        {
          $lookup: {
            from: 'moduletypes',
            localField: 'moduleType',
            foreignField: '_id',
            as: 'moduleType',
          },
        },
        { $unwind: { path: '$moduleType', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'templatetypes',
            localField: 'templateType',
            foreignField: '_id',
            as: 'templateType',
          },
        },
        { $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'experiencepoints',
            localField: 'xpId',
            foreignField: '_id',
            as: 'xp'
          }
        },
        { $unwind: { path: '$xp', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'questions',
            let: { "moduleId": "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$moduleId", "$moduleId"] },
                  status: 'ACTIVE'
                },
              },
              {
                $lookup: {
                  from: 'options',
                  let: { questionId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$$questionId", "$questionId"] },
                        status: 'ACTIVE'
                      },
                    },
                    {
                      $project: {
                        id: "$_id",
                        optionValue: 1,
                        optionText: 1,
                        optionImage: 1,
                        optionColour: 1,
                        displayOrder: 1,
                        validOption: 1,
                        status: 1,
                      }
                    }
                  ],
                  as: 'options',
                },
              },
              {
                $lookup: {
                  from: 'questiontypes',
                  localField: 'questionType',
                  foreignField: '_id',
                  as: 'questionType',
                },
              },
              { $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'templatetypes',
                  localField: 'templateType',
                  foreignField: '_id',
                  as: 'templateType',
                },
              },
              { $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 0,
                  questionId: "$_id",
                  templateType: {
                    id: "$templateType._id",
                    displayName: "$templateType.displayName",
                    displayValue: "$templateType.displayValue",
                    status: "$templateType.status"
                  },
                  questionTitle: 1,
                  questionType: {
                    id: "$questionType._id",
                    displayName: "$questionType.displayName",
                    displayValue: "$questionType.displayValue",
                    status: "$questionType.status"
                  },
                  options: 1,
                  hasMultiAnswers: 1,
                  hintText: 1,
                  hintImage: 1,
                  questionImage: 1,
                  status: 1,
                  displayOrder: 1,
                },
              },
            ],
            as: "questions",
          },
        },
        {
          $project: {
            moduleId: "$_id",
            unitId: "$unitId",
            moduleName: 1,
            bgColor: 1,
            imageUrl: 1,
            status: 1,
            completedPercentage: 1,
            moduleType: {
              id: "$moduleType._id",
              displayName: "$moduleType.displayName",
              displayValue: "$moduleType.displayValue",
              status: "$moduleType.status"
            },
            templateType: {
              id: "$templateType._id",
              displayName: "$templateType.displayName",
              displayValue: "$templateType.displayValue",
              status: "$templateType.status"
            },
            xp: {
              id: '$xp._id',
              name: '$xp.name',
              value: '$xp.value',
            },
            questions: 1,
            displayOrder: 1
          },
        },
      ]);

      const count = await this.ModuleModel.countDocuments(match).exec()
      return { ModuleList, count }
    } catch (error) {
      console.error(`Error fetching units with modules: ${error.message}`);
      return {}
    }
  }

  async findByEmail(email: string): Promise<Modules | null> {
    const Module = await this.ModuleModel.findOne({ email }).exec();
    return Module || null;
  }

  async getById(id: string): Promise<Modules> {
    return await this.ModuleModel.findOne({ _id: id })
      .populate('gems', 'id name value')
      .populate('xpId', 'id name value')
      .populate('megathilPoints', 'id name value')
      .populate('moduleType', 'id displayName displayValue')
      .populate('templateType', 'id displayName displayValue')
  }


  async findById(id: string, decodedToken: any): Promise<Modules> {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const moduleId = new ObjectId(id);
      const userId = new ObjectId(decodedToken.id);
      const ModuleIdData = await this.ModuleModel.aggregate([
        {
          $match: {
            _id: moduleId,
            status: 'ACTIVE'
          }
        },
        {
          $lookup: {
            from: 'moduletypes',
            localField: 'moduleType',
            foreignField: '_id',
            as: 'moduleType'
          }
        },
        { $unwind: { path: '$moduleType', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'templatetypes',
            localField: 'templateType',
            foreignField: '_id',
            as: 'templateType'
          }
        },
        { $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'experiencepoints',
            localField: 'xpId',
            foreignField: '_id',
            as: 'xp'
          }
        },
        { $unwind: { path: '$xp', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'userprogressstatuses',
            let: { "moduleId": "$_id", "userId": userId },
            pipeline: [
              {
                $match: {
                  $expr: { $and: [{ $eq: ["$$moduleId", "$moduleId"] }, { $eq: ["$$userId", "$userId"] }] },
                },
              }
            ],
            as: 'userModuleStatus',
          },
        },
        { $unwind: { path: '$userModuleStatus', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'questions',
            let: { "moduleId": "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$moduleId", "$moduleId"] },
                  status: 'ACTIVE'
                },
              },
              {
                $lookup: {
                  from: 'options',
                  let: { questionId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$$questionId", "$questionId"] },
                        status: 'ACTIVE'
                      },
                    },
                    {
                      $project: {
                        id: "$_id",
                        optionValue: 1,
                        optionText: 1,
                        optionImage: 1,
                        optionColour: 1,
                        validOption: 1,
                        status: 1,
                        displayOrder: { $toInt: "$displayOrder" },
                      }
                    },
                    {
                      $sort: { displayOrder: 1 }
                    }
                  ],
                  as: 'options',
                },
              },
              {
                $lookup: {
                  from: 'questiontypes',
                  localField: 'questionType',
                  foreignField: '_id',
                  as: 'questionType',
                },
              },
              { $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'templatetypes',
                  localField: 'templateType',
                  foreignField: '_id',
                  as: 'templateType',
                },
              },
              { $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 0,
                  questionId: "$_id",
                  templateType: {
                    id: "$templateType._id",
                    displayName: "$templateType.displayName",
                    displayValue: "$templateType.displayValue",
                    status: "$templateType.status"
                  },
                  questionTitle: 1,
                  questionType: {
                    id: "$questionType._id",
                    displayName: "$questionType.displayName",
                    displayValue: "$questionType.displayValue",
                    status: "$questionType.status"
                  },
                  options: 1,
                  hasMultiAnswers: 1,
                  hintText: 1,
                  hintImage: 1,
                  questionImage: 1,
                  status: 1,
                  displayOrder: { $toInt: "$displayOrder" },
                },
              },
              {
                $sort: { displayOrder: 1 }
              }
            ],
            as: "questions",
          },
        },
        {
          $project: {
            moduleId: '$_id',
            unitId: '$unitId',
            moduleName: 1,
            bgColor: 1,
            imageUrl: 1,
            status: 1,
            completedPercentage: 1,
            moduleType: {
              id: '$moduleType._id',
              displayName: '$moduleType.displayName',
              displayValue: '$moduleType.displayValue',
              status: '$moduleType.status'
            },
            templateType: {
              id: '$templateType._id',
              displayName: '$templateType.displayName',
              displayValue: '$templateType.displayValue',
              status: '$templateType.status'
            },
            xp: {
              id: '$xp._id',
              name: '$xp.name',
              value: '$xp.value',
            },
            questions: 1,
            displayOrder: 1,
            userModuleStatus: "$userModuleStatus"
          }
        }
      ]).exec();
      if (ModuleIdData.length > 0) {
        return ModuleIdData[0]
      } else {
        return null
      }
    } catch (error) {
      return null;
    }
  }

  async update(id: string, updatedModuleDto: UpdatedModuleDto): Promise<Modules> {
    return this.ModuleModel.findOneAndUpdate({ _id: id }, updatedModuleDto).exec();
  }

  async delete(id: string): Promise<Modules> {
    const deletedModule = await this.ModuleModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedModule
  }

}
