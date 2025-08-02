import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Badges } from './badges.schema';
import { Model } from 'mongoose';
import { BadgesDto } from './badges.dto';

@Injectable()
export class BadgesService {
  constructor(
    @InjectModel(Badges.name) private badgesModel: Model<Badges>,
  ) { }

  async create(badgesDto: BadgesDto): Promise<Badges> {
    return await this.badgesModel.create(badgesDto);
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

    const badges = await this.badgesModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.badgesModel.countDocuments(match).exec();
    return { badges, count };
  }

  async findByName(name: string): Promise<Badges | null> {
    return await this.badgesModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<Badges | null> {
    return await this.badgesModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<Badges> {
    return this.badgesModel.findById(id).exec();
  }

  async update(id: string, badgesDto: BadgesDto): Promise<Badges> {
    return this.badgesModel.findOneAndUpdate({ _id: id }, badgesDto).exec();
  }

  async delete(id: string) {
    const deletedCourse = await this.badgesModel.findByIdAndUpdate(
      id,
      { $set: { status: 'DELETED' } },
      { new: true }
    )
      .lean()
      .exec();
    return deletedCourse
  }

}
