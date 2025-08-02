import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExperiencePoints } from './Xp.schema';
import { CreateExperiencePointsDto } from './dto/createXp.dto';
import { UpdatedExperiencePointsDto } from './dto/updateXp.dto';
import * as _ from 'lodash';

@Injectable()
export class ExperiencePointsService {
  constructor(
    @InjectModel(ExperiencePoints.name) private ExperiencePointsModel: Model<ExperiencePoints>,
  ) { }

  async create(createExperiencePointsDto: CreateExperiencePointsDto): Promise<ExperiencePoints> {
    try {
      const createdExperiencePoints = new this.ExperiencePointsModel(createExperiencePointsDto);
      const data = await createdExperiencePoints.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error(`${error.message}`);
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    let match: any = { status: 'ACTIVE' }

    if (queryParams.name || queryParams.value) {
      const orCondition = []
      if (queryParams.name) {
        orCondition.push({
          name: new RegExp(`${queryParams.name}`, 'i')
        });
      }
      if (queryParams.value) {
        orCondition.push({
          value: Number(queryParams.value)
        });
      }
      match = { ...match, $or: orCondition }
    }


    if (queryParams.status) {
      match.status = queryParams.status;
    }
    const ExperiencePointsList = await this.ExperiencePointsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.ExperiencePointsModel.countDocuments(match).exec()
    return { ExperiencePointsList, count };
  }

  async findById(id: string): Promise<ExperiencePoints> {
    return this.ExperiencePointsModel.findById(id).exec();
  }

  async findByName(name: string): Promise<ExperiencePoints | null> {
    return await this.ExperiencePointsModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<ExperiencePoints | null> {
    return await this.ExperiencePointsModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async update(id: string, updatedExperiencePointsDto: UpdatedExperiencePointsDto): Promise<ExperiencePoints> {
    return this.ExperiencePointsModel.findOneAndUpdate({ _id: id }, updatedExperiencePointsDto).exec();
  }

  async delete(id: string) {
    const deletedExperiencePoints = await this.ExperiencePointsModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedExperiencePoints
  }

}
