import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GemsPackage } from './gemsPackage.schema';
import { CreateGemsPackageDto } from './dto/createGemsPackage.dto';
import { UpdatedGemsPackageDto } from './dto/updateGemsPackage.dto';
import * as _ from 'lodash';
import { CarouselDto } from './dto/carousel.dto';
import { GemsPackageCarousel } from './gemsPackageCarousel.schema';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { User } from '../users/users.schema';
import { Transaction } from '../transaction/transactions.schema';
import { PromoCode } from '../Promotors/promotor.schema';
const mongoose = require('mongoose');

@Injectable()
export class GemsPackageService {
  constructor(
    @InjectModel(GemsPackage.name) private GemsPackageModel: Model<GemsPackage>,
    @InjectModel(GemsPackageCarousel.name) private carouselModel: Model<GemsPackageCarousel>,
    @InjectModel(User.name) private UsersModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(PromoCode.name) private PromoCodeModel: Model<PromoCode>,
  ) { }

  async findGemsPackageForExistance(createGemsPackageDto: CreateGemsPackageDto): Promise<GemsPackage | null> {
    const orConditions = [{ packageName: createGemsPackageDto.packageName }];
    const match = { $or: orConditions, status: { $ne: 'DELETED' } };
    return this.GemsPackageModel.findOne(match).exec();
  }

  async create(createGemsPackageDto: CreateGemsPackageDto): Promise<GemsPackage> {
    try {
      const createdGemsPackage = new this.GemsPackageModel(createGemsPackageDto);
      const data = await createdGemsPackage.save();
      return data
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }

  async findAll(queryParams: any, tokenData: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    let match: any = {};
    if (tokenData.role === "ADMIN" || tokenData.role === "SUPER_ADMIN") {
      match.status = { $in: ['ACTIVE'] };
      if (queryParams.status) {
        match.status = queryParams.status;
      }
    } else {
      match.status = 'ACTIVE';
    }
    if (queryParams.packageName) {
      const packageName = new RegExp(queryParams.packageName, 'i');
      match.packageName = { $regex: packageName };
    }

    const GemsPackageList = await this.GemsPackageModel.find(match)
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .exec();
    const count = await this.GemsPackageModel.countDocuments(match).exec();
    return { GemsPackageList, count };
  }


  async findById(id: string): Promise<GemsPackage> {
    return this.GemsPackageModel.findById(id).exec();
  }

  async findByName(name: string): Promise<GemsPackage | null> {
    return await this.GemsPackageModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
  }

  async findByNameButId(name: string, id: string): Promise<GemsPackage | null> {
    return await this.GemsPackageModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async update(id: string, updatedGemsPackageDto: UpdatedGemsPackageDto): Promise<GemsPackage> {
    return this.GemsPackageModel.findOneAndUpdate({ _id: id }, updatedGemsPackageDto).exec();
  }

  async delete(id: string) {
    const deletedGemsPackage = await this.GemsPackageModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedGemsPackage
  }

  generatePromoCode(): string {
    const prefix = 'MEGT';
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumber}`;
  }

  async saveCarousel(carouselDto: CarouselDto) {
    const promoCode = this.generatePromoCode();
    const data = { ...carouselDto, promoCode };
    return await this.carouselModel.create(data);
  }

  async getCarouselsForUsers(userId: string | null) {
    const endOfDay = moment.utc().toDate();
      let collegeId = null;
      let promotedCode = '';
      let promotorId = null;
      let appliedPromoCodes: string[] = [];
      if (userId) {
        const user = await this.UsersModel.findById(userId).select('college promotedBy');
        if (user && user.college) {
          collegeId = user.college;
        }
        if (user && user.promotedBy) {
          promotedCode = user.promotedBy;
        }
        const promotor = await this.PromoCodeModel.findOne({ promotedCode }).select('id').exec();
        if (promotor && promotor.id) {
          promotorId = promotor.id;
        }
        const userTransactions = await this.transactionModel.find({
          userId: userId,
          'paymentResponse.notes.promoCode': { $exists: true }
        }).select('paymentResponse.notes.promoCode');
        // Get the applied promo codes by the user
        appliedPromoCodes = userTransactions.map(transaction => transaction.paymentResponse?.notes?.promoCode).filter(Boolean);
      }
      const matchConditions: any = {
        status: 'ACTIVE',
        validStartDate: { $lte: endOfDay },
        validEndDate: { $gte: endOfDay },
        $or: [
          { isLMSOffer: { $ne: true } }, // Explicitly check for false
          { isLMSOffer: { $exists: false } } // Handle documents without the isLMSOffer field
        ]
      };
      const collegeOffers = collegeId ? 
      await this.carouselModel
          .find({ ...matchConditions, college: collegeId, promoCode: { $nin: appliedPromoCodes } })
          .sort({ displayOrder: 1 })
          .select('title note imageUrl displayOrder status percentage validStartDate validEndDate promoCode')
          .populate('college', 'id name collegeLogo') : 
      [];
      const promotorOffers = promotorId ? 
      await this.carouselModel
          .find({ ...matchConditions, promotorId: promotorId, promoCode: { $nin: appliedPromoCodes } })
          .sort({ displayOrder: 1 })
          .select('title note imageUrl displayOrder status percentage validStartDate validEndDate promoCode')
          .populate('promotorId', 'id firstName lastName promotedCode') : 
      [];
      const generalOffers = await this.carouselModel
      .find({ ...matchConditions, college: { $eq: null }, promotorId: { $eq: null }, promoCode: { $nin: appliedPromoCodes } })
      .sort({ displayOrder: 1 })
      .select('title note imageUrl displayOrder status percentage validStartDate validEndDate promoCode');
      return [...collegeOffers, ...generalOffers, ...promotorOffers];
  }

  async getCarouselsForAdmin(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    let match: any = { status: 'ACTIVE',  isLMSOffer: {$ne: true}};
    const ObjectId = mongoose.Types.ObjectId;
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    if (queryParams.title) {
      const title = new RegExp(queryParams.title, 'i');
      match.title = { $regex: title };
    }
    if (queryParams.promotorId) {
      match.promotorId = new ObjectId(queryParams.promotorId);
    }
    if (queryParams.isLMSOffer !== undefined) {
      match.isLMSOffer = queryParams.isLMSOffer === 'true';
    }
    const carousels = await this.carouselModel.find(match).sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .populate('college', 'id name collegeLogo')
      .populate('promotorId', 'id firstName lastName promotedCode')
      .populate('topicsId', 'id topicName imageUrl description')
      .exec();
    const count = await this.carouselModel.countDocuments(match).exec();

    return { carousels, count }
  }

  async getCarouselById(id: string) {
    return await this.carouselModel.findOne({ _id: id, status: { $ne: 'DELETED' } }).populate('college', 'id name collegeLogo').populate('promotorId', 'id firstName lastName promotedCode').populate('topicsId', 'id topicName imageUrl description');
  }

  async updateCarousel(id: string, carouselDto: CarouselDto) {
    return await this.carouselModel.updateOne({ _id: id }, carouselDto);
  }

  async deleteCarouselById(id: string) {
    return await this.carouselModel.updateOne({ _id: id }, { status: 'DELETED' });
  }

  @Cron('0 0 0 * * *')
  async checkCarouselExpiry() {
    const currentDate = moment.utc().endOf('day').toDate();
    console.log("currentDate", currentDate)
    await this.carouselModel.updateMany(
      { validEndDate: { $lt: currentDate }, status: 'ACTIVE' },
      { $set: { status: 'INACTIVE' } }
    );
  } 

}
