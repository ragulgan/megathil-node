import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { VersionUpdate } from './versionUpdate.schema';
import { CreateVersionUpdateDto } from './dto/createVersionUpdate.dto';
import { UpdatedVersionUpdateDto } from './dto/updateVersionUpdate.dto';
import * as _ from 'lodash';

@Injectable()
export class VersionUpdateService {
  constructor(
    @InjectModel(VersionUpdate.name) private VersionUpdateModel: Model<VersionUpdate>,
  ) { }

  async create(createVersionUpdateDto: CreateVersionUpdateDto): Promise<VersionUpdate> {
    try {
      const createdVersionUpdate = new this.VersionUpdateModel(createVersionUpdateDto);
      const data = await createdVersionUpdate.save();
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
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    if (queryParams.platform) {
      match.platform = new RegExp(`^${queryParams.platform}$`, 'i');
    }
    const VersionUpdateList = await this.VersionUpdateModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.VersionUpdateModel.countDocuments(match).exec()
    return { VersionUpdateList, count };
  }

  async findById(id: string): Promise<VersionUpdate> {
    return this.VersionUpdateModel.findById(id).exec();
  }

  async findByPlatform(platform: any): Promise<VersionUpdate | null> {
    return await this.VersionUpdateModel.findOne({ platform: platform, status: { $ne: 'DELETED' } }).exec();
  }

  async findByVersionCode(versionCode: any): Promise<VersionUpdate | null> {
    return await this.VersionUpdateModel.findOne({ versionCode: versionCode, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<VersionUpdate | null> {
    return await this.VersionUpdateModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findByPlatformButId(platform: string, id: string) {
    return await this.VersionUpdateModel.findOne({ platform: new RegExp(`^${platform}$`, 'i'), status: { $ne: 'DELETED' }, _id: { $ne: id } })
  }

  async update(updatedVersionUpdateDto: UpdatedVersionUpdateDto[]) {
    const existPlatform: string[] = [];
    for (let i = 0; i < updatedVersionUpdateDto.length; i++) {
      const exist = await this.findByPlatformButId(updatedVersionUpdateDto[i].platform, updatedVersionUpdateDto[i].id);
      if (exist && exist.id) {
        existPlatform.push(exist.platform);
      } else {
        await this.VersionUpdateModel.updateOne({ _id: updatedVersionUpdateDto[i].id }, updatedVersionUpdateDto[i]);
      }
    }
    if (existPlatform.length) {
      return { status: "success", code: "5109", data: existPlatform.join(" ") + " already exist." }
    }
    return { status: "success", code: "5005", data: "Updated successfully." }
  }

  async delete(id: string) {
    const deletedVersionUpdate = await this.VersionUpdateModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedVersionUpdate
  }

}
