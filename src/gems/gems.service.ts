import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gems } from './gems.schema';
import { CreateGemsDto } from './dto/createGems.dto';
import { UpdatedGemsDto } from './dto/updateGems.dto';
import * as _ from 'lodash';

@Injectable()
export class GemsService {
  constructor(
    @InjectModel(Gems.name) private GemsModel: Model<Gems>,
  ) { }

  async create(createGemsDto: CreateGemsDto): Promise<Gems> {
    try {
      const createdGems = new this.GemsModel(createGemsDto);
      const data = await createdGems.save();
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
      if (queryParams.status) {
        orCondition.push({
          status: Number(queryParams.status)
        });
      }
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }
    const GemsList = await this.GemsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.GemsModel.countDocuments(match).exec()
    return { GemsList, count };
  }

  async findById(id: string): Promise<Gems> {
    return this.GemsModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Gems | null> {
    return await this.GemsModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<Gems | null> {
    return await this.GemsModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async update(id: string, updatedGemsDto: UpdatedGemsDto): Promise<Gems> {
    return this.GemsModel.findOneAndUpdate({ _id: id }, updatedGemsDto).exec();
  }

  async delete(id: string) {
    const deletedGems = await this.GemsModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedGems
  }

}
