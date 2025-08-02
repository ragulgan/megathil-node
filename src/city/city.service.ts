import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './city.schema';
import { CreateCityDto } from './dto/createCity.dto';
import { UpdatedCityDto } from './dto/updateCity.dto';
import * as _ from 'lodash';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CityService {
  constructor(
    @InjectModel(City.name) private CityModel: Model<City>,
  ) { }

  async create(createCityDto: CreateCityDto): Promise<City> {
    try {
      const createdCity = new this.CityModel(createCityDto);
      const data = await createdCity.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving City.");
    }
  }

  async findAllForDropdown(queryParams: any) {
    const match: any = { status: 'ACTIVE' };
    if (queryParams.name) {
      match.cityName = { $regex: queryParams.name, $options: 'i' };
    }
    return await this.CityModel.find(match).select("id cityName status").populate('countryId', 'id countryName countryCode')
    .populate('stateId', 'id stateName').collation({ locale: 'en', strength: 1 }).sort({ cityName: 1 });
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
    if (queryParams.stateId) {
      match.stateId = { $eq: queryParams.stateId };
    }
    if (queryParams.cityName) {
      match.cityName = { $regex: new RegExp(queryParams.cityName, 'i') };
    }

    const CityList = await this.CityModel.find(match)
      .populate('countryId', 'id countryName countryCode')
      .populate('stateId', 'id stateName')
      .sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.CityModel.countDocuments(match).exec()
    return { CityList, count };
  }

  async findByName(cityName: string): Promise<City | null> {
    return await this.CityModel.findOne({ cityName: cityName, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(cityName: string, id: string): Promise<City | null> {
    return await this.CityModel.findOne({ cityName: cityName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async findById(id: string): Promise<City> {
    return this.CityModel.findById(id).exec();
  }

  async update(id: string, updatedCityDto: UpdatedCityDto): Promise<City> {
    return this.CityModel.findOneAndUpdate({ _id: id }, updatedCityDto).exec();
  }

  async delete(id: string): Promise<City> {
    const deletedCity = await this.CityModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedCity
  }

}
