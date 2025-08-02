import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { College } from './college.schema';
import { Staff } from '../staff/staff.schema';
import { User } from '../users/users.schema';
import { CreateCollegeDto } from './dto/createCollege.dto';
import { UpdatedCollegeDto } from './dto/updateCollege.dto';
import * as _ from 'lodash';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CollegeService {
  constructor(
    @InjectModel(College.name) private CollegeModel: Model<College>,
    @InjectModel(Staff.name) private StaffModel: Model<Staff>,
    @InjectModel(User.name) private UserModel: Model<User>,
  ) { }

  async create(createCollegeDto: CreateCollegeDto): Promise<College> {
    try {
      const createdCollege = new this.CollegeModel(createCollegeDto);
      const data = await createdCollege.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error(`${error.message}`);
    }
  }

  async findAllForDropdown(queryParams: any) {
    const match: any = { status: 'ACTIVE' };
    if (queryParams.name) {
      match.name = { $regex: queryParams.name, $options: 'i' };
    }
    if (queryParams.institute) {
      match['instituteId'] = new ObjectId(queryParams.institute)
    }
    return await this.CollegeModel.find(match).select("id name collegeLogo").collation({ locale: 'en', strength: 1 }).sort({ name: 1 });
  }

  async findAll(queryParams: any) {
    const limit = queryParams.limit ? Number(queryParams.limit) : 10;
    const page = queryParams.page ? Number(queryParams.page) : 1;
    const skipValue = (page - 1) * limit;
    const match: any = { status: 'ACTIVE' };
    const ObjectId = mongoose.Types.ObjectId;
    if (queryParams.status) {
      match.status = queryParams.status;
    }

    if (queryParams.name) {
      match.name = { $regex: queryParams.name, $options: 'i' };
    }

    if (queryParams.institute) {
      match['instituteId'] = new ObjectId(queryParams.institute)
    }

    const CollegeList = await this.CollegeModel.aggregate([
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
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['ACTIVE', '$status']
                }
              }
            }
          ],
          foreignField: 'college',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'staffs',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['ACTIVE', '$status']
                }
              }
            }
          ],
          localField: '_id',
          foreignField: 'college',
          as: 'staffs',
        },
      },
      {
        $lookup: {
          from: 'institutes',
          localField: 'instituteId',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: "$name",
                id: "$_id",
                instituteLogo: "$instituteLogo",
                _id: 0
              }
            }
          ],
          as: 'instituteId'
        }
      },
      { $unwind: { path: '$instituteId', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          userCount: { $size: '$users' },
          staffCount: { $size: '$staffs' },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          status: 1,
          shortDescription: 1,
          collegeCode: 1,
          collegeLogo: 1,
          premiumUserUtilized: 1,
          premiumUserAlloted: 1,
          createdAt: 1,
          userCount: 1,
          staffCount: 1,
          instituteId: 1
        },
      },
    ]);

    const count = await this.CollegeModel.countDocuments(match).exec();
    return { CollegeList, count };
  }


  async findByEmail(email: string): Promise<College | null> {
    const College = await this.CollegeModel.findOne({ email }).exec();
    return College || null;
  }


  async findById(id: string) {
    const collegeId = new ObjectId(id);
    const collegeIdData = await this.CollegeModel.aggregate([
      {
        $match: {
          _id: collegeId,
          status: { $ne: 'DELETED' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['ACTIVE', '$status']
                }
              }
            }
          ],
          foreignField: 'college',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['ACTIVE', '$status']
                }
              }
            }
          ],
          foreignField: 'college',
          as: 'staffs',
        },
      },
      {
        $lookup: {
          from: 'institutes',
          localField: 'instituteId',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: "$name",
                id: "$_id",
                instituteLogo: "$instituteLogo",
                _id: 0
              }
            }
          ],
          as: 'instituteId'
        }
      },
      { $unwind: { path: '$instituteId', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          userCount: { $size: '$users' },
          staffCount: { $size: '$staffs' },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          status: 1,
          shortDescription: 1,
          collegeCode: 1,
          collegeLogo: 1,
          createdAt: 1,
          userCount: 1,
          staffCount: 1,
          premiumUserUtilized: 1,
          premiumUserAlloted: 1,
          instituteId: 1
        },
      },
    ]).exec();
    return collegeIdData
  }

  async update(id: string, updatedCollegeDto: UpdatedCollegeDto): Promise<College> {
    return this.CollegeModel.findOneAndUpdate({ _id: id }, updatedCollegeDto).exec();
  }

  async delete(id: string) {
    const staffsCount = await this.StaffModel.countDocuments({ college: id }).exec();
    const usersCount = await this.UserModel.countDocuments({ college: id }).exec();
    if (staffsCount > 0) return { code: '1553' }; // cannot delete as college linked with staffs
    if (usersCount > 0) return { code: '1554' }; // cannot delete as college linked with users
    const deleted = await this.CollegeModel.updateOne({ _id: id }, { status: 'DELETED' });
    return { code: '1052', deleted: deleted };
  }

  // commenting this for future use
  /* following delete will inactivate students and users along with college delege */
  // async delete(id: string) {
  //   try {
  //     const deletedCollege = await this.CollegeModel
  //       .findByIdAndUpdate(
  //         id,
  //         { $set: { status: 'DELETED' } },
  //         { new: true }
  //       )
  //       .lean()
  //       .exec();
  //     await this.StaffModel
  //       .updateMany(
  //         { college: new ObjectId(id) },
  //         { $set: { status: 'INACTIVE' } },
  //       )
  //       .lean()
  //       .exec();
  //     await this.UserModel
  //       .updateMany(
  //         { college: new ObjectId(id) },
  //         { $set: { status: 'INACTIVE' } },
  //       )
  //       .lean()
  //       .exec();
  //     return deletedCollege
  //   } catch (e) {
  //     return null
  //   }
  // }

}
