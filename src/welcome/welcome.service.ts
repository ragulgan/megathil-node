import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Welcome } from './welcome.schema';
import { CreateWelcomeDto } from './dto/createWelcome.dto';
import { UpdatedWelcomeDto } from './dto/updateWelcome.dto ';
import * as _ from 'lodash';

@Injectable()
export class WelcomeService {
  constructor(
    @InjectModel(Welcome.name) private WelcomesModel: Model<Welcome>,
  ) { }

  async create(createWelcomeDto: CreateWelcomeDto): Promise<Welcome> {
    const createdWelcome = new this.WelcomesModel(createWelcomeDto);
    return createdWelcome.save();
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    const match: { } = {};
    const WelcomeList = await this.WelcomesModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.WelcomesModel.countDocuments(match).exec()
    return { WelcomeList, count };
  }

  async findByEmail(email: string): Promise<Welcome | null> {
    const Welcome = await this.WelcomesModel.findOne({ email }).exec();
    return Welcome || null;
  }


  async findById(id: string): Promise<Welcome> {
    return this.WelcomesModel.findById(id).exec();
  }


  async update(id: string, updatedWelcomeDto: UpdatedWelcomeDto): Promise<Welcome> {
    return this.WelcomesModel.findOneAndUpdate({ _id: id }, updatedWelcomeDto).exec();
  }


  async delete(id: string): Promise<Welcome> {
    const deletedWelcome = await this.WelcomesModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedWelcome
  }

}
