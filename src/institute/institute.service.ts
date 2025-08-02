import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Institute } from './institute.schema';
import { College } from '../college/college.schema';
import { CreateInstituteDto } from './dto/institute.create.dto';
import { UpdatedInstituteDto } from './dto/institute.update.dto';
import * as _ from 'lodash';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class InstituteService {
  constructor(
    @InjectModel(Institute.name) private InstituteModel: Model<Institute>,
    @InjectModel(College.name) private CollegeModel: Model<College>,
  ) { }

  async create(createInstituteDto: CreateInstituteDto): Promise<Institute> {
    try {
      const createdInstitute = new this.InstituteModel(createInstituteDto);
      const data = await createdInstitute.save();
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
    return await this.InstituteModel.find(match).select("id name instituteLogo").collation({ locale: 'en', strength: 1 }).sort({ name: 1 });
  }

  async findAll(queryParams: any) {
    const limit = queryParams.limit ? Number(queryParams.limit) : 10;
    const page = queryParams.page ? Number(queryParams.page) : 1;
    const skipValue = (page - 1) * limit;
    const match: any = { status: 'ACTIVE' };
    if (queryParams.status) {
      match.status = queryParams.status;
    }

    if (queryParams.name) {
      match.name = { $regex: queryParams.name, $options: 'i' };
    }

    const InstituteList = await this.InstituteModel.aggregate([
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
          from: 'colleges',
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
          foreignField: 'instituteId',
          as: 'colleges',
        },
      },
      {
        $addFields: {
          collegeCount: { $size: '$colleges' },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          status: 1,
          shortDescription: 1,
          instituteCode: 1,
          instituteLogo: 1,
          createdAt: 1,
          collegeCount: 1,
        },
      },
    ]);

    const count = await this.InstituteModel.countDocuments(match).exec();
    return { InstituteList, count };
  }


  async findByEmail(email: string): Promise<Institute | null> {
    const Institute = await this.InstituteModel.findOne({ email }).exec();
    return Institute || null;
  }


  async findById(id: string) {
    const instituteId = new ObjectId(id);
    const instituteIdData = await this.InstituteModel.aggregate([
      {
        $match: {
          _id: instituteId,
          status: { $ne: 'DELETED' }
        }
      },
      {
        $lookup: {
          from: 'colleges',
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
          foreignField: 'instituteId',
          as: 'colleges',
        },
      },
      {
        $addFields: {
           collegeCount: { $size: '$colleges' },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          status: 1,
          shortDescription: 1,
          instituteCode: 1,
          instituteLogo: 1,
          createdAt: 1,
          collegeCount: 1
        },
      },
    ]).exec();
    return instituteIdData
  }

  async update(id: string, updatedInstituteDto: UpdatedInstituteDto): Promise<Institute> {
    return this.InstituteModel.findOneAndUpdate({ _id: id }, updatedInstituteDto).exec();
  }

  async delete(id: string) {
    const collegesCount = await this.CollegeModel.countDocuments({ instituteId: id }).exec();
    if (collegesCount > 0) return { code: '5104' }; // cannot delete as institute linked with colleges
    const deleted = await this.InstituteModel.updateOne({ _id: id }, { status: 'DELETED' });
    return { code: '5104', deleted: deleted };
  }
}
