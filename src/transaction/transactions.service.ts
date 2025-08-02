import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transactions.schema';
import { CreateTransactionDto } from './dto/createTransactions.dto';
import * as _ from 'lodash';
import * as moment from 'moment';
const mongoose = require('mongoose');

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private TransactionModel: Model<Transaction>,
  ) { }

  async create(createTransactionDto: CreateTransactionDto, userId: any): Promise<Transaction> {
    try {
      const transactionData = {
        ...createTransactionDto,
        userId
      }
      const createdTransaction = new this.TransactionModel(transactionData);
      const data = await createdTransaction.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error(`${error.message}`);
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