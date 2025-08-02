import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Unit } from './unit.schema';
import { CreateUnitDto } from './dto/createUnit.dto';
import { UpdatedUnitDto } from './dto/updateUnit.dto ';
import * as _ from 'lodash';
import { SystemVariables } from 'src/systemVariables/systemVariables.schema';
const mongoose = require('mongoose');

@Injectable()
export class UnitService {
  constructor(
    @InjectModel(Unit.name) private UnitModel: Model<Unit>,
    @InjectModel(SystemVariables.name) private systemVariablesModel: Model<SystemVariables>,
  ) { }

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    try {
      const createdUnit = new this.UnitModel(createUnitDto);
      const data = await createdUnit.save();
      await this.UnitModel.findOneAndUpdate({ _id: data._id }, { unitId: data._id }).exec();
      return data

    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving Unit.");
    }
  }

  async findAllMinimal(queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status
    }
    const unitList = await this.UnitModel.aggregate([
      { $match: match },
      {
        $project: {
          _id: 0,
          unitId: "$_id",
          unitName: 1,
          bgColor: 1,
          imageUrl: 1,
          displayOrder: { $toInt: '$displayOrder' },
          unlockCostInGems: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      },
      { $sort: { displayOrder: 1 } },
      { $skip: skipValue },
      { $limit: parsedLimit },
    ]);
    const count = await this.UnitModel.countDocuments(match).exec()
    return { unitList, count };
  }

  async findUserUnits(queryParams: any, userId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status
    }

    const unitList = await this.UnitModel.aggregate([
      { $match: match },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: "modules",
          let: { unitId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$unitId", "$unitId"] },
                    { $eq: ["$status", "ACTIVE"] }
                  ]
                }
              }
            }
          ],
          as: "modules"
        }
      },
    ]);
    const count = await this.UnitModel.countDocuments(match).exec()
    return { unitList, count };
  }

  async findAll(queryParams: any) {
    const userId = queryParams?.userId;
    let limit = Number(queryParams.limit) || 20;
    const match: any = { status: 'ACTIVE' }

    if (queryParams?.deviceType?.toUpperCase() === 'IOS') {
      const appVaribles = await this.systemVariablesModel.find({
        $or: [{ name: 'IS_UNIT_LIMITED_FOR_IOS' }, { name: 'UNIT_LIMIT_FOR_IOS' }]
      });

      if (appVaribles && appVaribles.length) {
        const unitLimited = appVaribles.find((item) => { return item.name === 'IS_UNIT_LIMITED_FOR_IOS' });
        if (unitLimited && unitLimited.value === 'YES') {
          const unitLimit = appVaribles.find((item) => { return item.name === 'UNIT_LIMIT_FOR_IOS' });
          if (unitLimit && unitLimit.value) {
            limit = Number(unitLimit.value);
          }
        }
      }
    }

    try {
      const unitList = await this.UnitModel.aggregate([
        { $match: match },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'userunitstatuses',
            let: { "unitId": "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$unitId", "$unitId"] },
                      { $eq: [new mongoose.Types.ObjectId(userId), "$userId"] }
                    ]
                  }
                }
              },
              {
                $sort: {
                  updatedAt: -1
                }
              },
            ],
            as: 'unitStatus'
          }
        },
        {
          $unwind: { path: '$unitStatus', preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: "modules",
            let: { "unitId": "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $and: [{ $eq: ['$$unitId', '$unitId'] }, { $eq: ['$status', 'ACTIVE'] }] },
                },
              },
              {
                $lookup: {
                  from: 'userprogressstatuses',
                  let: { "moduleId": "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$$moduleId", "$moduleId"] },
                            { $eq: [new mongoose.Types.ObjectId(userId), "$userId"] }
                          ]
                        }
                      }
                    },
                    {
                      $sort: {
                        updatedAt: -1
                      }
                    },
                  ],
                  as: 'userModuleStatus'
                }
              },
              {
                $unwind: { path: '$userModuleStatus', preserveNullAndEmptyArrays: true }
              },
              {
                $lookup: {
                  from: 'moduletypes',
                  localField: 'moduleType',
                  foreignField: '_id',
                  as: 'moduleType'
                }
              },
              {
                $unwind: { path: '$moduleType', preserveNullAndEmptyArrays: true }
              },
              {
                $lookup: {
                  from: 'templatetypes',
                  localField: 'templateType',
                  foreignField: '_id',
                  as: 'templateType'
                }
              },
              {
                $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true }
              },
              {
                $lookup: {
                  from: "questions",
                  let: { "moduleId": "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $and: [{ $eq: ["$$moduleId", "$moduleId"] }, { $eq: ['ACTIVE', '$status'] }] }
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
                    { $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true } },
                    {
                      $sort: { displayOrder: 1 }
                    }
                  ],
                  as: "questions"
                }
              },
              {
                $group: {
                  _id: "$_id",
                  moduleId: { $first: "$_id" },
                  moduleName: { $first: "$moduleName" },
                  bgColor: { $first: "$bgColor" },
                  imageUrl: { $first: "$imageUrl" },
                  status: { $first: "$status" },
                  completedPercentage: { $first: "$completedPercentage" },
                  moduleType: { $first: "$moduleType" },
                  templateType: { $first: "$templateType" },
                  questions: { $first: "$questions" },
                  displayOrder: { $first: { $toInt: "$displayOrder" } },
                  userModuleStatus: { $first: "$userModuleStatus" },
                }
              },
              {
                $project: {
                  _id: 0,
                  moduleId: "$moduleId",
                  moduleName: "$moduleName",
                  bgColor: "$bgColor",
                  imageUrl: "$imageUrl",
                  status: "$status",
                  completedPercentage: "$completedPercentage",
                  moduleType: "$moduleType",
                  templateType: "$templateType",
                  userModuleStatus: "$userModuleStatus",
                  displayOrder: "$displayOrder",
                  hasChildrens: {
                    $size: {
                      $filter: {
                        input: "$questions",
                        as: "item",
                        cond: { $eq: ["$$item.hasChildrens", true] }
                      }
                    }
                  },
                  moduleInstructionsCount: {
                    $size: {
                      $filter: {
                        input: "$questions",
                        as: "item",
                        cond: { $eq: ["$$item.questionType.displayValue", "moduleInstruction"] }
                      }
                    }
                  },
                  moduleQuestionsCount: {
                    $size: {
                      $filter: {
                        input: "$questions",
                        as: "item",
                        cond: { $eq: ["$$item.questionType.displayValue", "Modulequestions"] }
                      }
                    }
                  },
                }
              },
              {
                $sort: { displayOrder: 1 }
              }
            ],
            as: "modules"
          }
        },

        {
          $project: {
            _id: 0,
            unitId: "$_id",
            unitName: "$unitName",
            bgColor: "$bgColor",
            imageUrl: "$imageUrl",
            unlocked: "$unitStatus.unlocked",
            status: "$status",
            unlockCostInGems: "$unlockCostInGems",
            modules: 1,
            displayOrder: { $toInt: "$displayOrder" }
          },
        },
        {
          $sort: { displayOrder: 1 }
        }
      ]);
      return { unitList };
    } catch (error) {
      console.error(`Error fetching units with modules: ${error}`);
      return {}
    }
  }

  async findByEmail(email: string): Promise<Unit | null> {
    const Unit = await this.UnitModel.findOne({ email }).exec();
    return Unit || null;
  }

  async getById(id: string): Promise<Unit> {
    return await this.UnitModel.findOne({ _id: id })
      .populate('gems', 'id name value')
      .populate('xpId', 'id name value')
      .populate('megathilPoints', 'id name value');
  }

  async findById(id: string, decodedToken: any): Promise<Unit> {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const unitId = new ObjectId(id);
      const userId = new ObjectId(decodedToken.id);
      const unit = await this.UnitModel.aggregate([
        {
          $match: {
            _id: unitId,
            status: 'ACTIVE'
          }
        },
        {

          $lookup: {
            from: "modules",
            let: { "unitId": "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $and: [{ $eq: ['$$unitId', '$unitId'] }, { $eq: ['$status', 'ACTIVE'] }] },
                },
              },
              {
                $lookup: {
                  from: 'userprogressstatuses',
                  let: { "moduleId": "$_id", "userId": userId },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $and: [{ $eq: ["$$moduleId", "$moduleId"] }, { $eq: ["$$userId", "$userId"] }] }
                      }
                    },
                    {
                      $sort: {
                        updatedAt: -1
                      }
                    },
                  ],
                  as: 'userModuleStatus'
                }
              },
              { $unwind: { path: '$userModuleStatus', preserveNullAndEmptyArrays: true } },
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
                  from: "questions",
                  let: { "moduleId": "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$$moduleId", "$moduleId"] }
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
                    { $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true } },
                    {
                      $sort: { displayOrder: 1 }
                    }
                  ],
                  as: "questions"
                }
              },
              {
                $group: {
                  _id: "$_id",
                  moduleId: { $first: "$_id" },
                  moduleName: { $first: "$moduleName" },
                  bgColor: { $first: "$bgColor" },
                  imageUrl: { $first: "$imageUrl" },
                  status: { $first: "$status" },
                  completedPercentage: { $first: "$completedPercentage" },
                  moduleType: { $first: "$moduleType" },
                  templateType: { $first: "$templateType" },
                  questions: { $first: "$questions" },
                  displayOrder: { $first: { $toInt: "$displayOrder" } },
                  userModuleStatus: { $first: "$userModuleStatus" }
                }
              },
              {
                $project: {
                  _id: 0,
                  moduleId: "$moduleId",
                  moduleName: "$moduleName",
                  bgColor: "$bgColor",
                  imageUrl: "$imageUrl",
                  status: "$status",
                  completedPercentage: "$completedPercentage",
                  moduleType: "$moduleType",
                  templateType: "$templateType",
                  userModuleStatus: "$userModuleStatus",
                  displayOrder: "$displayOrder",
                  hasChildrens: {
                    $size: {
                      $filter: {
                        input: "$questions",
                        as: "item",
                        cond: { $eq: ["$$item.hasChildrens", true] }
                      }
                    }
                  },
                  moduleInstructionsCount: {
                    $size: {
                      $filter: {
                        input: "$questions",
                        as: "item",
                        cond: {
                          $and: [
                            { $eq: ["$$item.questionType.displayValue", "moduleInstruction"] },
                            { $eq: ["$$item.status", "ACTIVE"] }
                          ]
                        }
                      }
                    }
                  },
                  moduleQuestionsCount: {
                    $size: {
                      $filter: {
                        input: "$questions",
                        as: "item",
                        cond: {
                          $and: [
                            { $eq: ["$$item.questionType.displayValue", "Modulequestions"] },
                            { $eq: ["$$item.status", "ACTIVE"] }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              {
                $sort: { displayOrder: 1 }
              }
            ],
            as: "modules",
          }
        },
        {
          $project: {
            _id: 0,
            unitId: "$_id",
            unitName: "$unitName",
            unlockCostInGems: "$unlockCostInGems",
            bgColor: "$bgColor",
            imageUrl: "$imageUrl",
            unlocked: "$unlocked",
            status: "$status",
            modules: 1,
            displayOrder: { $toInt: "$displayOrder" }
          }
        },
        {
          $sort: { displayOrder: 1 }
        }
      ]);

      if (unit.length > 0) {
        return unit[0]
      } else {
        return null
      }
    } catch (error) {
      return null;
    }
  }

  async update(id: string, updatedUnitDto: UpdatedUnitDto): Promise<Unit> {
    return this.UnitModel.findOneAndUpdate({ _id: id }, updatedUnitDto).exec();
  }


  async delete(id: string): Promise<Unit> {
    const deletedUnit = await this.UnitModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedUnit
  }

}
