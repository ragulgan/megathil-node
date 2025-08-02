import { Injectable } from '@nestjs/common';
import { MobileCode } from './mobilecode-json.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMobilecodeDto } from './dto/createMobilecode-json.dto';

@Injectable()
export class MobilecodeJsonService {

 constructor(
  @InjectModel(MobileCode.name) private MobilecodeModel: Model<MobileCode>,
 ) { }

 async createMobileCodeJson(id: string, createMobilecodeDto: CreateMobilecodeDto): Promise<MobileCode> {
  return this.MobilecodeModel.findOneAndUpdate({ _id: id }, createMobilecodeDto).exec();
 }

 async findAll() {
  const MobilecodeList = await this.MobilecodeModel.find()
   .sort({ updatedAt: -1 })
   .limit(1)
   .exec();
  const count = await this.MobilecodeModel.countDocuments().exec()
  return { MobilecodeList, count };
 }

 async getMobilecodeId() {
  const MobilecodeList = await this.MobilecodeModel.find()
   .sort({ updatedAt: -1 })
   .limit(1)
   .exec();
  const dataId = MobilecodeList.map((data: any) => {
   const dataInfo = data._id.toString();
   return dataInfo
  });
  return dataId[0];
 }
}
