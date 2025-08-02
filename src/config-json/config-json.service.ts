import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Config } from './config-json.schema';
import { CreateConfigDto } from './dto/createConfig-json.dto';
import * as _ from 'lodash';

@Injectable()
export class ConfigJsonService {
constructor(
    @InjectModel(Config.name) private ConfigModel: Model<Config>,
  ) { }

  async createJsonContent(id: string, createConfigDto: CreateConfigDto): Promise<Config> {
    return this.ConfigModel.findOneAndUpdate({ _id: id }, createConfigDto).exec();
  }

  async findAll() {
    const ConfigList = await this.ConfigModel.find()
    .sort({ updatedAt: -1 }) 
    .limit(1) 
    .exec();
    const count = await this.ConfigModel.countDocuments().exec()
    return { ConfigList, count };
  }

  async getConfigId() {
    const ConfigList = await this.ConfigModel.find()
    .sort({ updatedAt: -1 }) 
    .limit(1) 
    .exec();
    const dataId = ConfigList.map((data:any) => {
      const dataInfo = data._id.toString(); 
      return dataInfo
     });

    return dataId[0];
  }
}