import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Trophies } from "./trophies.schema";
import { Model } from "mongoose";
import { TrophiesDto } from "./dto/trophies.dto";

@Injectable()
export class TrophiesService {
  constructor(
    @InjectModel(Trophies.name) private trophiesModel: Model<Trophies>,
  ) { }

  async create(trophiesDto: TrophiesDto): Promise<Trophies> {
    return await this.trophiesModel.create(trophiesDto);
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

    const trophies = await this.trophiesModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.trophiesModel.countDocuments(match).exec();
    return { trophies, count };
  }

  async findByName(name: string): Promise<Trophies | null> {
    return await this.trophiesModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<Trophies | null> {
    return await this.trophiesModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<Trophies> {
    return this.trophiesModel.findById(id).exec();
  }

  async update(id: string, trophiesDto: TrophiesDto): Promise<Trophies> {
    return this.trophiesModel.findOneAndUpdate({ _id: id }, trophiesDto).exec();
  }

  async delete(id: string) {
    const deletedCourse = await this.trophiesModel.findByIdAndUpdate(
      id,
      { $set: { status: 'DELETED' } },
      { new: true }
    )
      .lean()
      .exec();
    return deletedCourse
  }
}