import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './otp.schema';
import { LoginDto } from 'src/auth/dto/logindto';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
  ) { }

  async createOtp(mobileNumber: string, code: string): Promise<Otp> {
    const otp = new this.otpModel({ mobileNumber, code });
    return await otp.save();
  }
  async findByMobileNumberAndCode(
    mobileNumber: string,
    code: string,
  ): Promise<Otp | null> {
    return await this.otpModel.findOne({ mobileNumber, code }).exec();
  }

  async userLogin(req: { mobileNumber: any; type: any; }, code: number) {
    code = 1234;
    const otpNumber = await this.otpModel.findOne({
      mobileNumber: req.mobileNumber,
      status: 'ACTIVE',
    });

    if (otpNumber) {
      const data = await this.otpModel.findOneAndUpdate(
        { mobileNumber: req.mobileNumber },
        { new: true }
      );
      return data;
    } else {
      const userLogin = {
        otp: code,
        mobileNumber: req.mobileNumber,
        type: "NEW",
        status: 'ACTIVE',
      };
      const newData = new this.otpModel(userLogin);
      return await newData.save();
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const match: any = {
      email: { $exists: true },
    };
  
    if (queryParams.email) {
      match.$or = [
        { email: new RegExp(queryParams.email, 'i') },
      ];
    }

    if (queryParams.status) {
      match.status = new RegExp(queryParams.status, 'i');
    }

    const OtpList = await this.otpModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.otpModel.countDocuments(match).exec()
    return { OtpList, count };
  } 
}
