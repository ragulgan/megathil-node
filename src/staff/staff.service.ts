import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Staff } from './staff.schema';
import { CreateStaffDto } from './dto/createstaff.dto';
import { UpdatedStaffDto } from './dto/updateStaff.dto';
import * as _ from 'lodash';
import { StaffLoginDto } from 'src/auth/dto/logindto';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import { StaffActivities } from './staffActivities.schema';
import { StaffActivitiesDto } from './dto/staffActivities.dto';
import { AdminService } from '../adminUsers/admin.service';
const saltOrRounds = 10;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
import { EmailService } from '../emailService/emailService.service'

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private StaffModel: Model<Staff>,
    @InjectModel(StaffActivities.name) private staffActivitiesModel: Model<StaffActivities>,
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
  ) { }

  async create(createStaffDto: CreateStaffDto, decodedToken: any): Promise<Staff> {
    try {
      createStaffDto.password = await bcrypt.hash(createStaffDto.password, saltOrRounds);
      const createdStaff = new this.StaffModel(createStaffDto);
      const staff = await createdStaff.save(); //creating staff

      // will be uncommented once email template is ready
      const sendEmail = process.env.SEND_EMAIL;
        if (sendEmail && sendEmail === 'true') {
      try {
        const templateData = {
          "name": `${createStaffDto.firstName} ${createStaffDto.lastName}`,
          "message": "We’re excited to welcome you to the Megathil family! As part of our growing team, you’ll play a crucial role in helping us build a thriving learning community."
        }
        await this.emailService.sendMail(
          createStaffDto.email,
          "Welcome to Our Service",
          "STAFF",
          templateData
        ).then(()=>{})
      } catch { }
     }

      if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
        try {
          this.adminService.logAdminActivities({
            adminId: decodedToken.id,
            action: 'staff_created',
            activity: 'Staff created',
            staffId: staff.id,
            usefullIdFor: 'staffId',
            reason: `Staff created`
          }).then(() => { });
        } catch { }
      }

      try {//logging staff activities
        this.saveStaffActivity({
          staffId: staff.id,
          action: 'staff_created',
          activity: 'Staff created',
          usefullId: staff.createdBy,
          usefullIdFor: 'adminid',
          reason: `${staff.firstName} created by admin ${decodedToken?.firstName}.`
        }).then(() => { });
      } catch { }

      return staff;
    } catch (error) {
      console.log("error##", error);
      throw new Error("Validation Error occurred while saving staff.");
    }
  }

  async findStaffsMinimal() {
    return await this.StaffModel.find({ status: 'ACTIVE' }).select({
      firstName: 1,
      lastName: 1,
      profileImage: 1,
    })
      .populate('department', 'id name')
      .populate('college', 'id name collegeLogo');
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit) || 10
    const page = Number(queryParams.page) || 1
    const skipValue = (page - 1) * limit;
    let match: any = { status: 'ACTIVE' }

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber) {
      const orCondition = []
      if (queryParams.firstName) {
        const splitValue = queryParams.firstName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const firstName = filteredArr[0];
        if (firstName) {
          orCondition.push({
            firstName: new RegExp(`${firstName}`, 'i')
          });
        }
      }

      if (queryParams.lastName) {
        const splitValue = queryParams.lastName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const lastName = filteredArr[filteredArr.length - 1];
        if (lastName) {
          orCondition.push({
            lastName: new RegExp(`${lastName}`, 'i')
          });
        }
      }

      if (queryParams.email) {
        orCondition.push({
          email: new RegExp(`${queryParams.email}`, 'i')
        });
      }

      if (queryParams.mobileNumber) {
        orCondition.push({
          mobileNumber: new RegExp(`${queryParams.mobileNumber}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.gender) {
      match.gender = queryParams.gender;
    }

    if (queryParams.collegeId) {
      match['college'] = queryParams.collegeId
    }

    if (queryParams.courseId) {
      match['course'] = queryParams.courseId
    }

    if (queryParams.departmentId) {
      match['department'] = queryParams.departmentId
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    if (queryParams.registerdDateFrom && queryParams.registerdDateTo) {
      match['createdAt'] = {
        $gte: moment(queryParams.registerdDateFrom),
        $lte: moment(queryParams.registerdDateTo)
      }
    } else if (queryParams.registerdDateFrom) {
      match['createdAt'] = {
        $gte: moment(queryParams.registerdDateFrom)
      }
    } else if (queryParams.registerdDateTo) {
      match['createdAt'] = {
        $lte: moment(queryParams.registerdDateTo)
      }
    }

    if (queryParams.isLmsAdmin !== undefined) {
      match.isLmsAdmin = queryParams.isLmsAdmin === 'true';
    }

    const StaffList = await this.StaffModel.find(match)
      .select("-password")
      .sort({ updatedAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .populate('department', 'id name')
      .populate('college', 'id name collegeLogo')
      .exec();
    const count = await this.StaffModel.countDocuments(match).exec()
    return { StaffList, count };
  }

  async findByEmail(email: string): Promise<Staff | null> {
    const Staff = await this.StaffModel.findOne({ email }).exec();
    return Staff || null;
  }

  async findById(id: string): Promise<Staff> {
    return this.StaffModel.findById(id).select('-password').populate('college', 'id name collegeLogo').populate('department', 'id name').exec();
  }

  async update(id: string, updatedStaffDto: UpdatedStaffDto, decodedToken: any): Promise<Staff> {
    if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
      try {
        this.adminService.logAdminActivities({
          adminId: decodedToken.id,
          action: 'staff_updated',
          activity: 'Staff Updated',
          staffId: id,
          usefullIdFor: 'staffid',
          reason: `${updatedStaffDto.firstName} Staff Updated.`
        }).then(() => { });
      } catch { }
    }
    try {//logging staff activities
      this.saveStaffActivity({
        staffId: id,
        action: 'staff_updated',
        activity: 'Staff Updated',
        usefullId: id,
        usefullIdFor: 'staffid',
        reason: `${updatedStaffDto.firstName} updated by admin ${decodedToken?.firstName}.`
      }).then(() => { });
    } catch { }
    return this.StaffModel.findOneAndUpdate({ _id: id }, updatedStaffDto).exec();
  }

  async AdminUpdate(newStaffviewer: any) {
    return this.StaffModel.findOneAndUpdate(
      { _id: newStaffviewer.staffId },
      { password: newStaffviewer.password },
      { new: true }
    ).exec();
  }
  async updateStaffModel(id: string, updatedStaffDto: any): Promise<Staff> {
    const updateUser = await this.StaffModel.findOneAndUpdate({ _id: id }, updatedStaffDto).exec();
    return updateUser
  }


  async delete(id: string, decodedToken: any): Promise<Staff> {
    const deletedStaff = await this.StaffModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      ).lean()
      .exec();
    if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
      try {
        this.adminService.logAdminActivities({
          adminId: decodedToken.id,
          action: 'staff_deleted',
          activity: 'Staff Deleted',
          staffId: id,
          usefullIdFor: 'staffid',
          reason: `Staff Account Deleted.`
        }).then(() => { });
      } catch { }
    }
    try {//logging staff activities
      this.saveStaffActivity({
        staffId: id,
        action: 'staff_deleted',
        activity: 'Staff deleted',
        usefullId: id,
        usefullIdFor: 'staffid',
        reason: `Account deleted by admin ${decodedToken?.firstName}.`
      }).then(() => { });
    } catch { }

    return deletedStaff
  }

  async authenticateStaff(staffLoginDto: StaffLoginDto): Promise<any> {
    return this.StaffModel.findOne({ email: staffLoginDto.email }).populate('college', 'id name collegeLogo').exec();
  }

  async saveStaffActivity(staffActivitiesDto: StaffActivitiesDto) {
    return await this.staffActivitiesModel.create(staffActivitiesDto);
  }

  async findAllStaffActivities(queryParams: any) {
    const limit = Number(queryParams.limit) || 10
    const page = Number(queryParams.page) || 1
    const skipValue = (page - 1) * limit;
    const match = {};

    if (queryParams.staffId) {
      match["staffId"] = new ObjectId(queryParams.staffId);
    }

    let staffMatch: any = {};

    if (queryParams.firstName || queryParams.lastName) {
      const orCondition = [];

      if (queryParams.firstName) {
        const splitValue = queryParams.firstName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const firstName = filteredArr[0];
        if (firstName) {
          orCondition.push({
            'staff.firstName': new RegExp(`${firstName}`, 'i')
          });
        }
      }

      if (queryParams.lastName) {
        const splitValue = queryParams.lastName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const lastName = filteredArr[filteredArr.length - 1];
        if (lastName) {
          orCondition.push({
            'staff.lastName': new RegExp(`${lastName}`, 'i')
          });
        }
      }
      staffMatch = { $or: orCondition };
    }

    const activities = await this.staffActivitiesModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staff"
        }
      },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      { $match: { staff: { $ne: {} }, ...staffMatch } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          staffId: 1,
          action: 1,
          activity: 1,
          reason: 1,
          createdAt: 1,
          staff: {
            id: "$staff._id",
            firstName: "$staff.firstName",
            lastName: "$staff.lastName",
            email: "$staff.email",
            mobileNumber: "$staff.mobileNumber",
            profileImage: "$staff.profileImage"
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
          from: 'staffs',
          localField: 'staffId',
          foreignField: '_id',
          as: 'staff'
        }
      },
      {
        $unwind: { path: '$staff', preserveNullAndEmptyArrays: true }
      },
      { $match: { staff: { $ne: {} }, ...staffMatch } },
      { $count: 'total' }
    ];

    const countResult = await this.staffActivitiesModel.aggregate(countPipeline).exec();
    const count = countResult.length > 0 ? countResult[0].total : 0;
    return { activities, count };
  }

  async staffChangepassword(staffChangepasswordDto: any, staffId: any) {
    const { currentPassword, newPassword } = staffChangepasswordDto;
    const staff = await this.StaffModel.findById(staffId);
    if (!staff) {
      throw new Error('user not found');
    }
    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      throw new Error('incorrect');
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    staff.password = hashedPassword;
    const data = await staff.save();
    return data
  }

  async staffForgotPassword(staffForgotPasswordDto: any) {
    const { email, mobileNumber } = staffForgotPasswordDto;
    const staff = await this.StaffModel.findOne({
      $or: [
        { email: email },
        { mobileNumber: mobileNumber }
      ]
    }).exec();
    if (!_.isEmpty(staff)) {
      // const otp = Math.floor(100000 + Math.random() * 900000).toString();
      staff.otp = "1234";
      await staff.save();
      return staff;
    } else {
      return false
    }
  }

  async staffResetPassword(staffResetpasswordDto: any) {
    const { email, mobileNumber, newPassword, otp } = staffResetpasswordDto;
    const isOtpValid = await this.verifyOtp(email, mobileNumber, otp);
    if (!isOtpValid) {
      return false;
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    const staff = await this.StaffModel.findOneAndUpdate(
      {
        $or: [
          { email: email },
          { mobileNumber: mobileNumber }
        ]
      },
      {
        $set: { password: hashedPassword, otp: '' }
      },
      {
        new: true,
        runValidators: true
      }
    ).exec();
    const data = await staff.save();
    return data;
  }

  async verifyOtp(email: string, mobileNumber: string, otp: string): Promise<boolean> {
    const staff = await this.StaffModel.findOne({
      $or: [
        { email: email },
        { mobileNumber: mobileNumber }
      ]
    });
    if (!staff) {
      return false;
    }
    if (staff.otp !== otp) {
      return false;
    }
    return true
  }
}
