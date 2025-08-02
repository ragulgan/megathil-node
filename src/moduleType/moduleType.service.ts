import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModuleType } from './moduleType.schema';
import { CreateModuleTypeDto } from './dto/createModuleType.dto';
import { UpdatedModuleTypeDto } from './dto/updateModuleType.dto';
import * as _ from 'lodash';

@Injectable()
export class ModuleTypeService {
  constructor(
    @InjectModel(ModuleType.name) private ModuleTypeModel: Model<ModuleType>,
  ) { }

  async create(createModuleTypeDto: CreateModuleTypeDto): Promise<ModuleType> {
    try {
      const createdModuleType = new this.ModuleTypeModel(createModuleTypeDto);
      const data = await createdModuleType.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving ModuleType.");
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    if (queryParams.displayName) {
      const displayNameRegex = new RegExp(queryParams.displayName, 'i');
      match.displayName = { $regex: displayNameRegex };
    }
    const ModuleTypeList = await this.ModuleTypeModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.ModuleTypeModel.countDocuments(match).exec()
    return { ModuleTypeList, count };
  }

  async findByEmail(email: string): Promise<ModuleType | null> {
    const ModuleType = await this.ModuleTypeModel.findOne({ email }).exec();
    return ModuleType || null;
  }


  async findById(id: string): Promise<ModuleType> {
    return this.ModuleTypeModel.findById(id).exec();
  }


  async update(id: string, updatedModuleTypeDto: UpdatedModuleTypeDto): Promise<ModuleType> {
    return this.ModuleTypeModel.findOneAndUpdate({ _id: id }, updatedModuleTypeDto).exec();
  }


  async delete(id: string): Promise<ModuleType> {
    const deletedModuleType = await this.ModuleTypeModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedModuleType
  }

}
