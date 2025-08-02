import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TemplateType } from './templateType.schema';
import { CreateTemplateTypeDto } from './dto/createTemplateType.dto';
import { UpdatedTemplateTypeDto } from './dto/updateTemplateType.dto';
import * as _ from 'lodash';

@Injectable()
export class TemplateTypeService {
  constructor(
    @InjectModel(TemplateType.name) private TemplateTypeModel: Model<TemplateType>,
  ) { }

  async create(createTemplateTypeDto: CreateTemplateTypeDto): Promise<TemplateType> {
    try {
      const createdTemplateType = new this.TemplateTypeModel(createTemplateTypeDto);
      const data = await createdTemplateType.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving TemplateType.");
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit;

    let match: any = { status: 'ACTIVE' }

    if (queryParams.name) {
      const orCondition = []
      orCondition.push({
        displayValue: new RegExp(`${queryParams.name}`, 'i')
      }, {
        displayName: new RegExp(`${queryParams.name}`, 'i')
      });
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }
    const TemplateTypeList = await this.TemplateTypeModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.TemplateTypeModel.countDocuments(match).exec()
    return { TemplateTypeList, count };
  }

  async findByDisplayName(displayName: string, displayValue: string): Promise<TemplateType | null> {
    return await this.TemplateTypeModel.findOne({ $or: [{ displayValue: displayValue }, { displayName: displayName }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByDisplayNameButId(displayName: string, displayValue: string, id: string): Promise<TemplateType | null> {
    return await this.TemplateTypeModel.findOne({ $or: [{ displayValue: displayValue }, { displayName: displayName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }


  async findById(id: string): Promise<TemplateType> {
    return this.TemplateTypeModel.findById(id).exec();
  }


  async update(id: string, updatedTemplateTypeDto: UpdatedTemplateTypeDto): Promise<TemplateType> {
    return this.TemplateTypeModel.findOneAndUpdate({ _id: id }, updatedTemplateTypeDto).exec();
  }


  async delete(id: string): Promise<TemplateType> {
    const deletedTemplateType = await this.TemplateTypeModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedTemplateType
  }

}
