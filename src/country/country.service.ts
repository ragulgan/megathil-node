import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from './country.schema';
import { CreateCountryDto } from './dto/createCountry.dto';
import { UpdatedCountryDto } from './dto/updateCountry.dto';
import * as _ from 'lodash';

@Injectable()
export class CountryService {
  constructor(
    @InjectModel(Country.name) private CountryModel: Model<Country>,
  ) { }

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    try {
      const createdCountry = new this.CountryModel(createCountryDto);
      const data = await createdCountry.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving Country.");
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    let match: any = { status: 'ACTIVE' }


    if (queryParams.countryName || queryParams.countryCode) {
      const orCondition = []
      if (queryParams.countryName) {
        orCondition.push({
          countryName: new RegExp(`${queryParams.countryName}`, 'i')
        });
      }
      if (queryParams.countryCode) {
        orCondition.push({
          countryCode: new RegExp(`${queryParams.countryCode}`, 'i')
        });
      }
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    const CountryList = await this.CountryModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.CountryModel.countDocuments(match).exec()
    return { CountryList, count };
  }

  async findAllForDropdown(queryParams: any) {
    const match: any = { status: 'ACTIVE' };
    if (queryParams.name) {
      match.countryName = { $regex: queryParams.name, $options: 'i' };
    }
    return await this.CountryModel.find(match).select("id countryName countryCode status").collation({ locale: 'en', strength: 1 }).sort({ countryName: 1 });
  }

  async findById(id: string): Promise<Country> {
    return this.CountryModel.findById(id).exec();
  }

  async findByName(countryName: string, countryCode: string): Promise<Country | null> {
    return await this.CountryModel.findOne({ $or: [{ countryCode: countryCode }, { countryName: countryName }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(countryName: string, countryCode: string, id: string): Promise<Country | null> {
    return await this.CountryModel.findOne({ $or: [{ countryCode: countryCode }, { countryName: countryName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }


  async update(id: string, updatedCountryDto: UpdatedCountryDto): Promise<Country> {
    return this.CountryModel.findOneAndUpdate({ _id: id }, updatedCountryDto).exec();
  }


  async delete(id: string): Promise<Country> {
    const deletedCountry = await this.CountryModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedCountry
  }

}
