import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schema';
import { CreateRoleDto } from './dto/create.dto';
import { UpdateRoleDto } from './dto/update.dto ';



@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private SiteModel: Model<Role>) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const createSite = new this.SiteModel(createRoleDto);
    return createSite.save();
  }

  async findAll(queryParams) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    let match: any = { status: 'ACTIVE' }

    if (queryParams.role) {
      const orCondition = []
      orCondition.push({
        role: new RegExp(`${queryParams.role}`, 'i')
      }, {
        displayName: new RegExp(`${queryParams.role}`, 'i')
      });
      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    const roleList = await this.SiteModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.SiteModel.countDocuments(match).exec()
    return { roleList, count };
  }

  async findById(id: string): Promise<Role> {
    return this.SiteModel.findById(id).exec();
  }

  async findByRole(role: string, displayName: string): Promise<Role> {
    return this.SiteModel.findOne({ $or: [{ role: role }, { displayName: displayName }], status: { $ne: 'DELETED' } }).exec();
  }

  async findByRoleButId(role: string, displayName: string, id: string): Promise<Role> {
    return this.SiteModel.findOne({ $or: [{ role: role }, { displayName: displayName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.SiteModel.findOneAndUpdate({ _id: id }, updateRoleDto).exec();
  }


  async delete(id: string): Promise<Role> {
    const deleteSite = await this.SiteModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      ).lean()
      .exec();
    return deleteSite
  }

}
