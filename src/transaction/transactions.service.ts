import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transactions.schema';
import { CreateTransactionDto } from './dto/createTransactions.dto';
import * as _ from 'lodash';
import * as moment from 'moment';
const mongoose = require('mongoose');
const Razorpay = require('razorpay');

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private TransactionModel: Model<Transaction>,
  ) { }

  getSecret(mode: string) {
    if (mode === 'LIVE') {
      return {
        key_id: process.env.RAZORPAY_KEY_ID_LIVE,
        key_secret: process.env.RAZORPAY_SECRETKEY_LIVE,
      }
    }
    return {
      key_id: process.env.RAZORPAY_KEY_ID_TEST,
      key_secret: process.env.RAZORPAY_SECRETKEY_TEST,
    }
  }

  async create(createTransactionDto: CreateTransactionDto, userId: any): Promise<Transaction> {
    try {
      const razorpay_payment_id = createTransactionDto.refNumber;
      
      if (!razorpay_payment_id) {
        throw new Error('Payment reference number is required');
      }

      const secretData = this.getSecret(process.env.PAYMENT_MODE);
      const instance = new Razorpay(secretData);
      const paymentData = await instance.payments.fetch(razorpay_payment_id);
      
      if (!paymentData) {
        throw new Error('Invalid payment reference number. Payment not found in Razorpay.');
      }

      const transactionData = {
        ...createTransactionDto,
        userId
      };

      const createdTransaction = new this.TransactionModel(transactionData);
      const data = await createdTransaction.save();
      return data;
    } catch (error) {
      console.error("Transaction Creation Error:", error);
      // Extract error message from Razorpay error object
      let errorMessage = 'Failed to validate payment';
      if (error?.error?.description) {
        errorMessage = error.error.description;
      } else if (error?.description) {
        errorMessage = error.description;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }  
      throw new Error(errorMessage);
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const ObjectId = mongoose.Types.ObjectId;

    let match: any = {};

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    if (queryParams.id) {
      match._id = new ObjectId(queryParams.id);
    }

    if (queryParams.transactionFrom && queryParams.transactionTo) {
      match['createdAt'] = {
        $gte: moment(queryParams.transactionFrom).startOf('day').toDate(),
        $lte: moment(queryParams.transactionTo).endOf('day').toDate()
      };
    }

    if (moment(queryParams.transactionFrom, true).isValid()) {
      match['createdAt'] = { $gte: moment(queryParams.transactionFrom).startOf('day').toDate() };
    }
    if (moment(queryParams.transactionTo, true).isValid()) {
      match['createdAt'] = { $lte: moment(queryParams.transactionTo).endOf('day').toDate() };
    }

    const userMatch: any = {};

    if (queryParams.userId) {
      userMatch['user._id'] = new ObjectId(queryParams.userId);
    }

    if (queryParams.firstName) {
      userMatch['user.firstName'] = { $regex: queryParams.firstName, $options: 'i' };
    }

    if (queryParams.lastName) {
      userMatch['user.lastName'] = { $regex: queryParams.lastName, $options: 'i' };
    }

    const transactions = await this.TransactionModel.aggregate([
      {
        $match: match
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true } ,
      },
      {
      $lookup: {
          from: 'topics',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topic'
        }
      },
      { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
      {
      $lookup: {
          from: 'gemspackagecarousels',
          localField: 'offerId',
          foreignField: '_id',
          as: 'offer'
        }
      },
      { $unwind: { path: '$offer', preserveNullAndEmptyArrays: true } },
      {
        $match: userMatch
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skipValue
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          item: 1,
          refNumber: 1,
          payment: 1,
          reason: 1,
          paymentResponse: 1,
          status: 1,
          createdAt: 1,
          user: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email',
            mobileNumber: '$user.mobileNumber',
            profileImage: '$user.profileImage'
          },
          topic: {
            id: '$topic._id',
            topicName: '$topic.topicName',
            imageUrl: '$topic.imageUrl',
            description: '$topic.description',
            price: '$topic.price',
            topicSource: '$topic.topicSource',
            status: '$topic.status'
          },
          offer: {
            id: '$offer._id',
            title: '$offer.title',
            note: '$offer.note',
            promoCode: '$offer.promoCode',
            percentage: '$offer.percentage',
            validStartDate: '$offer.validStartDate',
            validEndDate: '$offer.validEndDate',
            status: '$offer.status',
            topicId: '$offer.topicId'
          }
        }
      }
    ]).exec();

    const countPipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true } ,
      },
      { $match: userMatch },
      { $count: 'total' }
    ];

    const countResult = await this.TransactionModel.aggregate(countPipeline).exec();
    const count = countResult.length > 0 ? countResult[0].total : 0;
    return { TransactionList: transactions, count };
  }


}