import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lang } from './lang.schema';
import { CreateLangDto } from './dto/createlang.dto';
import { UpdatedLangDto } from './dto/updatelang.dto ';
import * as _ from 'lodash';

@Injectable()
export class LangService {
  constructor(
    @InjectModel(Lang.name) private LangModel: Model<Lang>,
  ) { }

  async create(createLangDto: CreateLangDto): Promise<Lang> {
    try {
      const createdLang = new this.LangModel(createLangDto);
      return await createdLang.save();
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving Lang.");
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    const match: { email?: RegExp, mobileNumber?: RegExp } = {};
    if (queryParams.email) {
      match.email = new RegExp(queryParams.email, 'i')
    } if (queryParams.mobileNumber) {
      match.mobileNumber = new RegExp(queryParams.mobileNumber, 'i')
    }
    const LangList = await this.LangModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.LangModel.countDocuments(match).exec()
    return { LangList, count };
  }

  async findByEmail(email: string): Promise<Lang | null> {
    const Lang = await this.LangModel.findOne({ email }).exec();
    return Lang || null;
  }


  async findById(id: string): Promise<Lang> {
    return this.LangModel.findById(id).exec();
  }


  async update(id: string, updatedLangDto: UpdatedLangDto): Promise<Lang> {
    return this.LangModel.findOneAndUpdate({ _id: id }, updatedLangDto).exec();
  }


  async delete(id: string): Promise<Lang> {
    const deletedLang = await this.LangModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedLang
  }

}
