import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './course.schema';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdatedCourseDto } from './dto/updateCourse.dto';
import * as _ from 'lodash';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private CourseModel: Model<Course>,
  ) { }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const createdCourse = new this.CourseModel(createCourseDto);
      const data = await createdCourse.save();
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

    if (queryParams.name || queryParams.abbreviation) {
      const orCondition = []
      if(queryParams.name){
        orCondition.push({
          name: new RegExp(`${queryParams.name}`, 'i')
        });
      }
      if(queryParams.abbreviation){
        orCondition.push({
          abbreviation: new RegExp(`${queryParams.abbreviation}`, 'i')
        });
      }
      
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    if (queryParams.departmentId) {
      match.departmentId = new mongoose.Types.ObjectId(queryParams.departmentId);
    }
    const CourseList = await this.CourseModel.find(match)
      .select('id name abbreviation shortDescription status')
      .populate('departmentId', 'id name abbreviation').collation({ locale: 'en', strength: 1 }).sort({ name: 1 }).skip(skipValue).limit(limit).exec();
    const count = await this.CourseModel.countDocuments(match).exec()
    return { CourseList, count };
  }

  async findAllForDropdown(queryParams: any) {
    const match: any = { status: 'ACTIVE' };
    if (queryParams.name) {
      match.name = { $regex: queryParams.name, $options: 'i' };
    }
    if (queryParams.departmentId) {
      match.departmentId = queryParams.departmentId;
    }
    return await this.CourseModel.find(match).select('id name abbreviation shortDescription status').populate('departmentId', 'id name abbreviation').collation({ locale: 'en', strength: 1 }).sort({ name: 1 });
  }

  async findByName(name: string, abbreviation: string): Promise<Course | null> {
    return await this.CourseModel.findOne({ $or: [{ abbreviation: abbreviation }, { name: name }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, abbreviation: string, id: string): Promise<Course | null> {
    return await this.CourseModel.findOne({ $or: [{ abbreviation: abbreviation }, { name: name }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }


  async findById(id: string): Promise<Course> {
    return this.CourseModel.findById(id).exec();
  }


  async update(id: string, updatedCourseDto: UpdatedCourseDto): Promise<Course> {
    return this.CourseModel.findOneAndUpdate({ _id: id }, updatedCourseDto).exec();
  }


  async delete(id: string) {
    const deletedCourse = await this.CourseModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedCourse
  }

}
