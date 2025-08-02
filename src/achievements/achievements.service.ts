import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Achievements } from './achievements.schema';
import { Model } from 'mongoose';
import { AchievementsDto } from './achievements.dto';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievements.name) private achievementsModel: Model<Achievements>,
  ) { }

  async create(achievementsDto: AchievementsDto): Promise<Achievements> {
    return await this.achievementsModel.create(achievementsDto);
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit;
    const match = {
      status: { $ne: 'DELETED' }
    }
    if (queryParams.name) {
      match['name'] = new RegExp(`${queryParams.name}`, 'i')
    }
    match['status'] = queryParams.status || 'ACTIVE';
    const badges = await this.achievementsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.achievementsModel.countDocuments(match).exec();
    return { badges, count };
  }

  async findByName(name: string, keyName: string): Promise<Achievements | null> {
    return await this.achievementsModel.findOne({ $or: [{ name: name }, { keyName: keyName }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, keyName: string, id: string): Promise<Achievements | null> {
    return await this.achievementsModel.findOne({ n$or: [{ name: name }, { keyName: keyName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<Achievements> {
    return this.achievementsModel.findById(id).exec();
  }

  async update(id: string, achievementsDto: AchievementsDto): Promise<Achievements> {
    return this.achievementsModel.findOneAndUpdate({ _id: id }, achievementsDto).exec();
  }

  async delete(id: string) {
    const deletedCourse = await this.achievementsModel.findByIdAndUpdate(
      id,
      { $set: { status: 'DELETED' } },
      { new: true }
    )
      .lean()
      .exec();
    return deletedCourse
  }
}
