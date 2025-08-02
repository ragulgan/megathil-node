import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MegathilPoints } from './megathil-points.schema';
import { Model } from 'mongoose';
import { MegathilPointsDto } from './megathil-points.dto';

@Injectable()
export class MegathilPointsService {
  constructor(
    @InjectModel(MegathilPoints.name) private methathilPointsModel: Model<MegathilPoints>,
  ) { }

  async create(megathilPointsDto: MegathilPointsDto): Promise<MegathilPoints> {
    return await this.methathilPointsModel.create(megathilPointsDto);
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit;

    const match: any = {
      status: { $ne: 'DELETED' }
    };
    
    if (queryParams.name) {
      match['name'] = new RegExp(`${queryParams.name}`, 'i');
    }
    if (queryParams.status) {
      match['status'] = queryParams.status;
    }
    const badges = await this.methathilPointsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.methathilPointsModel.countDocuments(match).exec();
    return { badges, count };
  }

  async findByName(name: string): Promise<MegathilPoints | null> {
    return await this.methathilPointsModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<MegathilPoints | null> {
    return await this.methathilPointsModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<MegathilPoints> {
    return this.methathilPointsModel.findById(id).exec();
  }

  async update(id: string, megathilPointsDto: MegathilPointsDto): Promise<MegathilPoints> {
    return this.methathilPointsModel.findOneAndUpdate({ _id: id }, megathilPointsDto).exec();
  }

  async delete(id: string) {
    const deletedCourse = await this.methathilPointsModel.findByIdAndUpdate(
      id,
      { $set: { status: 'DELETED' } },
      { new: true }
    )
      .lean()
      .exec();
    return deletedCourse
  }
}
