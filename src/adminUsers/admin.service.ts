import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Admin } from './admin.schema';
import { CreateAdminDto } from './dto/createAdmin.dto';
import { UpdatedAdminDto } from './dto/updateAdmin.dto ';
import * as _ from 'lodash';
import { AdminActivity } from './adminActivites.schema';
import { PasswordDto } from './dto/password.dto';
const bcrypt = require('bcrypt');
const saltOrRounds = 10;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<Admin>,
    @InjectModel(AdminActivity.name) private AdminActivityModel: Model<AdminActivity>,
  ) { }

  async create(createAdminDto: CreateAdminDto) {
    const existingAdmin = await this.AdminModel.findOne({ email: createAdminDto.email, status: 'ACTIVE' }).exec();
    if (_.isEmpty(existingAdmin)) {
      const createdAdmin = new this.AdminModel(createAdminDto);
      return createdAdmin.save();
    } else {
      return null
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    let match: any = { status: queryParams.status || 'ACTIVE' };
    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber) {
      const orCondition = [];
      if (queryParams.firstName) {
        orCondition.push({ firstName: new RegExp(queryParams.firstName, 'i') });
      }
      if (queryParams.lastName) {
        orCondition.push({ lastName: new RegExp(queryParams.lastName, 'i') });
      }
      if (queryParams.email) {
        orCondition.push({ email: new RegExp(queryParams.email, 'i') });
      }
      if (queryParams.mobileNumber) {
        orCondition.push({ mobileNumber: new RegExp(queryParams.mobileNumber, 'i') });
      }
      match = { ...match, $or: orCondition };
    }
    if (queryParams.roleId) {
      match['role'] = queryParams.roleId
    }
    const AdminList = await this.AdminModel.find(match)
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .populate('role')
      .exec();

    const count = await this.AdminModel.countDocuments(match).exec();
    return { AdminList, count };
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const Admin = await this.AdminModel.findOne({ email }).exec();
    return Admin || null;
  }


  async findById(id: string): Promise<Admin> {
    return this.AdminModel.findById(id).select('-password').populate('role', "id name displayName").exec();
  }

  async findByIdValidate(id: string): Promise<Admin> {
    return this.AdminModel.findById(id).exec();
  }

  async updateProfile(id: string, updatedAdminDto: UpdatedAdminDto): Promise<Admin> {
    return this.AdminModel.findOneAndUpdate({ _id: id }, updatedAdminDto).exec();
  }

  async updatePassword(id: string, passwordDto: PasswordDto) {
    const admin = await this.AdminModel.findOne({ _id: id, status: 'ACTIVE' });
    if (!admin) {
      return { status: 'error', code: "5017" }
    }

    const isValidPassword = bcrypt.compareSync(passwordDto.currentPassword, admin.password);
    if (!isValidPassword) {
      return { status: 'error', code: "2000" }
    }
    const isPasswordMatch = bcrypt.compareSync(passwordDto.newPassword, admin.password);
    if (isPasswordMatch) {
      return { status: 'error', code: "4303" }
    }

    const encriptedPassword = await bcrypt.hash(passwordDto.newPassword, saltOrRounds);
    const updated = await this.AdminModel.updateOne({ _id: id }, { password: encriptedPassword });
    return { status: 'success', code: '2004', data: updated }
  }

  async update(id: string, updatedAdminDto: UpdatedAdminDto): Promise<Admin> {
    return await this.AdminModel.findOneAndUpdate({ _id: id }, updatedAdminDto).exec();
  }


  async delete(id: string): Promise<Admin> {
    const deletedAdmin = await this.AdminModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return deletedAdmin
  }

  async adminLogin(req: any) {
    const user: any = await this.AdminModel.findOne({ email: req.email }).populate('role');
    if (!user) return false;
    const isPasswordMatch = bcrypt.compareSync(req.password, user.password);
    if (!isPasswordMatch) return false;
    return user;
  }

  async AdminUpdate(newAdmin: any) {
    return this.AdminModel.findOneAndUpdate(
      { _id: newAdmin._doc._id },
      { password: newAdmin.password },
      { new: true }
    ).exec();
  }

  async getAllAdminActivities(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const match: any = {};
    if (queryParams.adminId) {
      match["adminId"] = new ObjectId(queryParams.adminId);
    }
  
    let adminMatch: any = {};

    if (queryParams.firstName || queryParams.lastName) {
      const orCondition = [];

      if (queryParams.firstName) {
        const splitValue = queryParams.firstName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const firstName = filteredArr[0];
        if (firstName) {
          orCondition.push({
            'admin.firstName': new RegExp(`${firstName}`, 'i')
          });
        }
      }
    
      if (queryParams.lastName) {
        const splitValue = queryParams.lastName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const lastName = filteredArr[filteredArr.length - 1];
        if (lastName) {
          orCondition.push({
            'admin.lastName': new RegExp(`${lastName}`, 'i')
          });
        }
      }
      adminMatch = { $or: orCondition };
    }
  
    const activities = await this.AdminActivityModel.aggregate([
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
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'admins',
          let: { adminId: '$adminId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$adminId'] } } },
            {
              $lookup: {
                from: 'roles',
                localField: 'role',
                foreignField: '_id',
                as: 'role'
              }
            },
            {
              $unwind: { path: '$role', preserveNullAndEmptyArrays: true }
            },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                mobileNumber: 1,
                profileImage: 1,
                role: {
                  id: '$role._id',
                  role: '$role.role',
                  displayName: '$role.displayName'
                }
              }
            }
          ],
          as: 'admin'
        }
      },
      {
        $unwind: { path: '$admin', preserveNullAndEmptyArrays: true }
      },
      { $match: { adminId: { $ne: {} }, ...adminMatch } },
      {
        $lookup: {
          from: 'staffs',
          localField: 'staffId',
          foreignField: '_id',
          as: 'staff'
        }
      },
      {
        $unwind: { path: '$staff', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'interviewers',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer'
        }
      },
      {
        $unwind: { path: '$interviewer', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          action: 1,
          activity: 1,
          reason: 1,
          usefullIdFor: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email',
            mobileNumber: '$user.mobileNumber',
            role: '$user.role'
          },
          adminId: {
            id: '$admin._id',
            firstName: '$admin.firstName',
            lastName: '$admin.lastName',
            email: '$admin.email',
            mobileNumber: '$admin.mobileNumber',
            profileImage: '$admin.profileImage',
            role: '$admin.role'
          },
          staffId: {
            id: '$staff._id',
            firstName: '$staff.firstName',
            lastName: '$staff.lastName',
            email: '$staff.email',
            mobileNumber: '$staff.mobileNumber',
            role: '$staff.role'
          },
          interviewerId: {
            id: '$interviewer._id',
            firstName: '$interviewer.firstName',
            lastName: '$interviewer.lastName',
            email: '$interviewer.email',
            mobileNumber: '$interviewer.mobileNumber',
            role: '$interviewer.role'
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skipValue },
      { $limit: limit },
    ]).exec();
  
    const countPipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'admins',
          localField: 'adminId',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $unwind: { path: '$admin', preserveNullAndEmptyArrays: true } ,
      },
      { $match: { adminId: { $ne: {} }, ...adminMatch } },
      { $count: 'total' }
    ];
  
    const countResult = await this.AdminActivityModel.aggregate(countPipeline).exec();
    const count = countResult.length > 0 ? countResult[0].total : 0;
  
    return { activities, count };
  } 

  async getAdminActivities(adminId: any, queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;

    const match: any = {};
    if (queryParams.action) {
      match.action = queryParams.action;
    }
    if (adminId) {
      match.adminId = adminId;
    }

    const AdminList = await this.AdminActivityModel.find(match)
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .populate({
        path: 'adminId',
        select: 'firstName lastName email mobileNumber profileImage role',
        populate: {
          path: 'role',
          select: 'role displayName'
        }
      }).populate('userId', 'firstName lastName email mobileNumber')
      .populate('staffId', 'firstName lastName email mobileNumber')
      .populate('interviewerId', 'firstName lastName email mobileNumber')
      .exec();
    const count = await this.AdminActivityModel.countDocuments(match).exec();
    return { AdminList, count };
  }


  async logAdminActivities(params: any) {
    const activity = new this.AdminActivityModel(params);
    return activity.save();
  }


}
