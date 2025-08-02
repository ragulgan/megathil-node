import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoginHistory } from './schema';



@Injectable()
export class LoginHistoryService {
  constructor(@InjectModel(LoginHistory.name) private SiteModel: Model<LoginHistory>) { }

  async findAll(queryParams) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    const match: any = { status: 'ACTIVE' }
    if (queryParams.LoginHistory) {
      match.LoginHistory = new RegExp(queryParams.LoginHistory, 'i')
    }
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    const LoginHistoryList = await this.SiteModel
    .find(match)
    .sort({ createdAt: -1 })
    .skip(skipValue)
    .limit(limit)
    .populate('userId')
    .exec();
        const count = await this.SiteModel.countDocuments(match).exec()
    return { LoginHistoryList, count };
  }

}
