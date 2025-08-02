import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department } from './department.schema';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdatedDepartmentDto } from './dto/updateDepartment.dto';
import * as _ from 'lodash';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private DepartmentModel: Model<Department>,
  ) { }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      const createdDepartment = new this.DepartmentModel(createDepartmentDto);
      const data = await createdDepartment.save();
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

    if (queryParams.name) {
      const orCondition = []
      orCondition.push({
        name: new RegExp(`${queryParams.name}`, 'i')
      });
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    const DepartmentList = await this.DepartmentModel.find(match).select('id name abbreviation shortDescription status').collation({ locale: 'en', strength: 1 }).sort({ name: 1 }).skip(skipValue).limit(limit).exec();
    const count = await this.DepartmentModel.countDocuments(match).exec()
    return { DepartmentList, count };
  }

  async findAllForDropdown(queryParams: any) {
    const match: any = { status: 'ACTIVE' };
    if (queryParams.name) {
      match.name = { $regex: queryParams.name, $options: 'i' };
    }
    return await this.DepartmentModel.find(match).select("id name").collation({ locale: 'en', strength: 1 }).sort({ name: 1 });
  }

  async findByEmail(email: string): Promise<Department | null> {
    const Department = await this.DepartmentModel.findOne({ email }).exec();
    return Department || null;
  }

  async findByName(name: string, abbreviation: string): Promise<Department | null> {
    return await this.DepartmentModel.findOne({ $or: [{ abbreviation: abbreviation }, { name: name }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, abbreviation: string, id: string): Promise<Department | null> {
    return await this.DepartmentModel.findOne({ $or: [{ abbreviation: abbreviation }, { name: name }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<Department> {
    return this.DepartmentModel.findById(id).exec();
  }


  async update(id: string, updatedDepartmentDto: UpdatedDepartmentDto): Promise<Department> {
    return this.DepartmentModel.findOneAndUpdate({ _id: id }, updatedDepartmentDto).exec();
  }


  async delete(id: string) {
    const deletedDepartment = await this.DepartmentModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedDepartment
  }

}
