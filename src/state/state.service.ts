import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { State } from './state.schema';
import { CreateStateDto } from './dto/createState.dto';
import { UpdatedStateDto } from './dto/updateState.dto';
import * as _ from 'lodash';

@Injectable()
export class StateService {
  constructor(
    @InjectModel(State.name) private StateModel: Model<State>,
  ) { }

  async create(createStateDto: CreateStateDto): Promise<State> {
    try {
      const createdState = new this.StateModel(createStateDto);
      const data = await createdState.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving State.");
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    const match: any = { status: 'ACTIVE' }
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    if (queryParams.countryId) {
      match.countryId = { $eq: queryParams.countryId };
    }
    if (queryParams.stateName) {
      match.stateName = { $regex: new RegExp(queryParams.stateName, 'i') };
    }

    const StateList = await this.StateModel.find(match).populate('countryId', 'id countryName countryCode').sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.StateModel.countDocuments(match).exec()
    return { StateList, count };
  }

  async findAllForDropdown(queryParams: any) {
    const match: any = { status: 'ACTIVE' };
    if (queryParams.name) {
      match.stateName = { $regex: queryParams.name, $options: 'i' };
    }
    return await this.StateModel.find(match).select("id stateName status").populate('countryId', 'id countryName countryCode').collation({ locale: 'en', strength: 1 }).sort({ stateName: 1 });
  }

  async findById(id: string): Promise<State> {
    return this.StateModel.findById(id).exec();
  }

  async findByName(stateName: string): Promise<State | null> {
    return await this.StateModel.findOne({ stateName: stateName, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(stateName: string, id: string): Promise<State | null> {
    return await this.StateModel.findOne({ stateName: stateName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async update(id: string, updatedStateDto: UpdatedStateDto): Promise<State> {
    return this.StateModel.findOneAndUpdate({ _id: id }, updatedStateDto).exec();
  }

  async delete(id: string): Promise<State> {
    const deletedState = await this.StateModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedState
  }

}
