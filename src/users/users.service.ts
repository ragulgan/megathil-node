import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
const mongoose = require('mongoose');
import { User } from './users.schema';
import { CreateUserDto } from '../users/dto/createuser.dto';
import { UpdatedUserDto } from '../users/dto/updateuser.dto ';
import { Otp } from '../otp/otp.schema';
import { LoginHistory } from '../loginHistory/schema';
import * as _ from 'lodash';
import { VALIDATE_USER } from '../libs/constants'
import * as moment from 'moment';
import { InitiateDto, LoginDto, OtpDto } from 'src/auth/dto/logindto';
import { UserEarnings } from './userEarnings.schema';
import { UserActivity } from './usersActivites.schema';
import { UserProgressStatus } from './userProgressStatus.schema';
import { StaffActivities } from 'src/staff/staffActivities.schema';
import { StaffActivitiesDto } from 'src/staff/dto/staffActivities.dto';
import { UserTrophies } from './userTrophies.schema';
import { Unit } from 'src/unit/unit.schema';
import { Modules } from 'src/module/module.schema';
import { Question } from 'src/question/question.schema';
import { UserProgressStatusDto } from './dto/userProgressStatus.dto';
import { generateReferralCode, removeNullNodes, sanitizeUpdateData, xpMilestones } from '../utill/utill';
import { Achievements } from 'src/achievements/achievements.schema';
import { Transaction } from '../transaction/transactions.schema';
import { GemsPackage } from '../gemsPackage/gemsPackage.schema';
import { UserUnitStatus } from './userUnitStatus.schema';
import { AdminService } from '../adminUsers/admin.service';
import { SystemVariables } from 'src/systemVariables/systemVariables.schema';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { College } from 'src/college/college.schema';
import { Gems } from 'src/gems/gems.schema';
import { GemsCount } from 'src/gems/gemsTotal.schema';
import { UserScores } from './userScores.schema';
import axios from 'axios';
import { PaymentDto } from './dto/payment.dto';
const Razorpay = require('razorpay');
import { EmailService } from '../emailService/emailService.service'
import { UserScoreHistories } from './userScoreHistory.schema';
import { UserGainGem } from './userGemsGain.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.schema';
import * as json2xls from 'json2xls';
import { UserAchievement } from './userAchievement.schema';
import * as pdf from 'html-pdf';
import { Twilio } from 'twilio';
import { PromoCode } from '../Promotors/promotor.schema';
import { Staff } from '../staff/staff.schema';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UsersModel: Model<User>,
    @InjectModel(Otp.name) private OtpModel: Model<Otp>,
    @InjectModel(LoginHistory.name) private LoginHistoryModule: Model<LoginHistory>,
    @InjectModel(UserEarnings.name) private userEarningsModel: Model<UserEarnings>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>,
    @InjectModel(UserProgressStatus.name) private usersProgressStatusModel: Model<UserProgressStatus>,
    @InjectModel(UserUnitStatus.name) private usersUnitStatusModel: Model<UserUnitStatus>,
    @InjectModel(UserTrophies.name) private userTrophiesModel: Model<UserTrophies>,
    @InjectModel(StaffActivities.name) private staffActivitiesModel: Model<StaffActivities>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    @InjectModel(Modules.name) private moduleModel: Model<Modules>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Achievements.name) private achievementsModel: Model<Achievements>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(GemsPackage.name) private gemsPackageModel: Model<GemsPackage>,
    @InjectModel(Gems.name) private gemsModel: Model<Gems>,
    @InjectModel(GemsCount.name) private gemsCountModel: Model<GemsCount>,
    @InjectModel(SystemVariables.name) private systemVariablesModel: Model<SystemVariables>,
    @InjectModel(College.name) private collegeModel: Model<College>,
    @InjectModel(UserScores.name) private userScoresModel: Model<UserScores>,
    @InjectModel(UserScoreHistories.name) private userScoreHistoriesModel: Model<UserScoreHistories>,
    @InjectModel(UserGainGem.name) private userGainGemModel: Model<UserGainGem>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(UserAchievement.name) private UserAchievementModel: Model<Notification>,
    @InjectModel(PromoCode.name) private PromoCodeModel: Model<PromoCode>,
    @InjectModel(Staff.name) private StaffModel: Model<Staff>,

    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService

  ) { }

  async findUserForExistance(createUserDto: any): Promise<User | null> {
    let orConditions: any[] = [
      { email: new RegExp(`^${createUserDto.email}$`, 'i') },
      { mobileNumber: new RegExp(`^${createUserDto.mobileNumber}$`, 'i') }
    ];
    if (createUserDto.studentId) {
      orConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toLower: "$studentId" },
            regex: createUserDto.studentId.toLowerCase()
          }
        }
      });
    }
    const match = { $or: orConditions, status: { $ne: 'DELETED' } };
    return await this.UsersModel.findOne(match).exec();
  }

  async findUserForExistanceButId(id: string, updatedUserDto: UpdatedUserDto): Promise<User | null> {
    let orConditions: any[] = [{ email: updatedUserDto.email }, { mobileNumber: updatedUserDto.mobileNumber }]
    if (updatedUserDto.studentId) {
      orConditions.push({ studentId: updatedUserDto.studentId })
    }
    const match = { _id: { $ne: id }, $or: orConditions, status: { $ne: 'DELETED' } }
    return await this.UsersModel.findOne(match).exec();
  }

  async findCollegeById(collegeId) {
    return this.collegeModel.findOne({ _id: collegeId, status: 'ACTIVE' });
  }

  async create(createUserDto: CreateUserDto, id: string, role: string): Promise<User> {
    try {
      const becameMember = await this.achievementsModel.findOne({ keyName: 'BECOME_MEMBER' });

      const data = {
        ...createUserDto,
        isExistUser: true,
        source: 'WEB',
        referralCode: generateReferralCode()
      }

      if (becameMember) {
        data['gemValue'] = becameMember?.gemValue;
        data['xpValue'] = becameMember?.xpValue;
        data['megathilPoints'] = becameMember?.megathilPoints;
      }

      if (createUserDto.email) {
        data['isExistUser'] = true;
      }

      if (createUserDto.userType === 'PREMIUM') {
        const college = await this.findCollegeById(createUserDto.college);
        if (!college) {
          data['userType'] = 'BASIC';
          console.log("College not found for premium user, create user as basic user.")
        }
        if (college.premiumUserAlloted < 1) {
          data['userType'] = 'BASIC';
          console.log("College not having enough allocation for premium user, create user as basic user.")
        }
      }

      const newUser = await this.UsersModel.create(data);

      // will be uncommented once email template is ready
      const sendEmail = process.env.SEND_EMAIL;
      if (sendEmail && sendEmail === 'true') {
        try {
          const templateData = {
            "name": `${createUserDto.firstName} ${createUserDto.lastName}`,
            "message": "I hope you are having a great day!"
          }
          await this.emailService.sendMail(
            createUserDto.email,
            "Welcome to Our Service",
            "USER",
            templateData
          ).then(() => { })
        } catch { }
      }

      this.userEarningsModel.create({//saving user earings while creating user
        userId: newUser._id.toString(),
        activity: "Awared gems",
        action: "registered",
        reason: 'Bonus gems for becoming a Megathil user.',
        gemValue: becameMember.gemValue,
        xpValue: becameMember.xpValue,
        megathilValue: becameMember.megathilPoints,
        earnedOrSpent: 'AWARDED',
      }).then(() => { })

      this.transactionModel.create({
        item: "GEMS",
        quantity: becameMember.gemValue,
        userId: newUser._id,
        refNumber: null,
        payment: null,
        reason: 'Awarded gems as the welcome bonus.',
        status: 'SUCCESS'
      }).then(() => { });

      // data.userType is PREMIUM here means college has eligibility to create premium user.
      // and created one premium user
      if (data.userType === 'PREMIUM') {
        const permiumBonus = await this.gemsModel.findOne({ name: 'PREMIUM_BONUS' });
        await this.UsersModel.updateOne({ _id: newUser._id }, { $inc: { gemValue: permiumBonus.value } });
        await this.collegeModel.updateOne({ _id: newUser.college }, { $inc: { premiumUserAlloted: -1, premiumUserUtilized: 1 } });
        this.userEarningsModel.create({//saving user earings while creating user as premium bonus
          userId: newUser._id.toString(),
          activity: "Special Bonus",
          action: "premium_bonus",
          reason: 'Awarded gems for restisted as premium user.',
          gemValue: permiumBonus.value,
          xpValue: 0,
          megathilValue: 0,
          earnedOrSpent: 'AWARDED',
        }).then(() => { });

        this.transactionModel.create({
          item: "GEMS",
          quantity: permiumBonus.value,
          userId: newUser._id,
          refNumber: null,
          payment: null,
          reason: 'Awarded gems as the bonus for permium users.',
          status: 'SUCCESS'
        }).then(() => { });
      }

      if (role === 'STAFF') {
        try {//logging staff activities
          this.saveStaffActivity({
            staffId: id,
            action: 'created_user',
            activity: 'Created User',
            usefullId: newUser.id,
            usefullIdFor: 'userid',
            reason: `Created user: ${newUser.firstName}.`
          }).then(() => { });
        } catch { }
      }

      if (role === 'ADMIN') {
        try {
          this.adminService.logAdminActivities({
            adminId: id,
            action: 'created_user',
            activity: 'Created User',
            userId: newUser.id,
            usefullIdFor: 'userid',
            reason: `Created user: ${newUser.firstName}.`
          }).then(() => { });
        } catch { }
      }

      try {
        this.logUserActivity({
          userId: newUser.id,
          activity: 'Account Created',
          action: 'account_created',
          shortDescription: 'User account created.',
        }).then(() => { });
      } catch { }
      try {
      this.initiateUserProgressStatus(newUser.id).then(() => { });
      this.initiateOrUpdateUserUnitStatus(newUser.id).then(() => { });
      } catch { }
      return newUser;
    } catch (e) {
      console.log("Error:", e)
      throw new Error(e);
    }
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    let match: any = { status: 'ACTIVE' };

    const ObjectId = mongoose.Types.ObjectId;

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.promotedBy) {
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

      if (queryParams.promotedBy) {
        orCondition.push({
          promotedBy: new RegExp(`${queryParams.promotedBy}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match['status'] = queryParams.status
    }

    if (queryParams.userType) {
      match['userType'] = queryParams.userType
    }


    if (queryParams.collegeId) {
      if (_.isArray(queryParams.collegeId)) {
        match['college'] = { $in: queryParams.collegeId.map((id: string) => new ObjectId(id)) };
      } else {
        match['college'] = new ObjectId(queryParams.collegeId);
      }
    }

    if (queryParams.courseId) {
      if (_.isArray(queryParams.courseId)) {
        match['course'] = { $in: queryParams.courseId.map((id: string) => new ObjectId(id)) };
      } else {
        match['course'] = new ObjectId(queryParams.courseId);
      }
    }

    if (queryParams.departmentId) {
      if (_.isArray(queryParams.departmentId)) {
        match['department'] = { $in: queryParams.departmentId.map((id: string) => new ObjectId(id)) };
      } else {
        match['department'] = new ObjectId(queryParams.departmentId);
      }
    }

    if (queryParams.gender) {
      match['gender'] = queryParams.gender.toUpperCase();
    }

    if (queryParams.countryId) {
      match['country'] = new ObjectId(queryParams.countryId)
    }

    if (queryParams.stateId) {
      match['state'] = new ObjectId(queryParams.stateId)
    }

    if (queryParams.cityId) {
      match['city'] = new ObjectId(queryParams.cityId)
    }

    if (queryParams.staffId) {
      match['staff'] = new ObjectId(queryParams.staffId)
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

    if (queryParams.graduatedDateFrom && queryParams.graduatedDateTo) {
      match['monthAndYearOfPassingOut'] = {
        $gte: moment(queryParams.graduatedDateFrom),
        $lte: moment(queryParams.graduatedDateTo)
      }
    } else if (queryParams.graduatedDateFrom) {
      match['monthAndYearOfPassingOut'] = {
        $gte: moment(queryParams.graduatedDateFrom)
      }
    } else if (queryParams.graduatedDateTo) {
      match['monthAndYearOfPassingOut'] = {
        $lte: moment(queryParams.graduatedDateTo)
      }
    }

    const sortCriteria: any = {};
    if (queryParams.sortBy === 'firstName') {
      sortCriteria.firstName = queryParams.sort === 'asc' ? 1 : -1;
    } else {
      sortCriteria.createdAt = -1;
    }

    try {
      const userList = await this.UsersModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  countryName: "$countryName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'country'
          }
        },
        {
          $lookup: {
            from: 'states',
            localField: 'state',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  stateName: "$stateName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'state'
          }
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'city',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  cityName: "$cityName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'city'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'course'
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'department'
          }
        },
        {
          $lookup: {
            from: 'colleges',
            localField: 'college',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  collegeLogo: "$collegeLogo",
                  _id: 0
                }
              }
            ],
            as: 'college'
          }
        },
        {
          $lookup: {
            from: 'institutes',
            localField: 'instituteId',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  instituteLogo: "$instituteLogo",
                  _id: 0
                }
              }
            ],
            as: 'instituteId'
          }
        },
        {
          $lookup: {
            from: 'staffs',
            localField: 'staff',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  firstName: "$firstName",
                  id: "$_id",
                  lastName: "$lastName",
                  _id: 0
                }
              }
            ],
            as: 'staff'
          }
        },
        {
          $lookup: {
            from: "otps",
            let: { userEmail: "$email", userMobile: "$mobileNumber" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $and: [{ $eq: ["$email", "$$userEmail"] }, { $eq: ["$status", "VERIFIED"] }] },
                      { $and: [{ $eq: ["$mobileNumber", "$$userMobile"] }, { $eq: ["$status", "VERIFIED"] }] }
                    ]
                  }
                }
              },
              { $sort: { updatedAt: -1 } },
              { $limit: 1 },
              {
                $project: {
                  lastLoginTime: "$updatedAt",
                  _id: 0
                }
              }
            ],
            as: "loginInfo"
          }
        },  
        {
          $lookup: {
            from: 'userprogressstatuses',
            localField: '_id',
            foreignField: 'userId',
            pipeline: [
              // Lookup units within userProgressStatus
              {
                $lookup: {
                  from: "units",
                  localField: "unitId",
                  foreignField: "_id",
                  as: "unitDetails"
                }
              },
              { $unwind: "$unitDetails" },
              { $addFields: { "unitDetails.displayOrderNum": { $toInt: "$unitDetails.displayOrder" } } },
              // Lookup modules within userProgressStatus
              {
                $lookup: {
                  from: "modules",
                  localField: "moduleId",
                  foreignField: "_id",
                  as: "moduleDetails"
                }
              },
              { $unwind: "$moduleDetails" },
              { $addFields: { "moduleDetails.displayOrderNum": { $toInt: "$moduleDetails.displayOrder" } } },
              // Sort by displayOrderNum in descending order
              { $sort: { "unitDetails.displayOrderNum": -1, "moduleDetails.displayOrderNum": -1 } },
              // Limit to get the highest displayOrder
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  unit: {
                    $ifNull: [
                      { $concat: ["Unit ", { $toString: "$unitDetails.displayOrder" }] },
                      "Not started"
                    ]
                  },
                  module: {
                    $ifNull: [
                      { $concat: ["Module ", { $toString: "$moduleDetails.displayOrder" }] },
                      "Not started"
                    ]
                  }
                }
              }
            ],
            as: 'userProgressStatus'
          }
        },
        {
          $unwind: { path: '$userProgressStatus', preserveNullAndEmptyArrays: true }
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$loginInfo', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$instituteId', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            id: "$_id"
          }
        },
        { $sort: sortCriteria },
        { $skip: skipValue },
        { $limit: limit }
      ]).exec();
      const count = await this.UsersModel.countDocuments(match).exec();
      return { userList, count };
    } catch (error) {
      throw new Error("An error occurred while fetching users.");
    }
  }

  async findAllUserUnderCollegeInsite(queryParams: any, authId: string) {
    const staffDetails = await this.StaffModel.findById(authId).select('college').exec();
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    let match: any = { 
      $and: [
        { status: 'ACTIVE' },
        { college: staffDetails.college },
        // { source : "WEB"},
        { userType : "PREMIUM"}
      ]
    };

    const ObjectId = mongoose.Types.ObjectId;

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.promotedBy) {
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

      if (queryParams.promotedBy) {
        orCondition.push({
          promotedBy: new RegExp(`${queryParams.promotedBy}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match['status'] = queryParams.status
    }

    if (queryParams.userType) {
      match['userType'] = queryParams.userType
    }

    if (queryParams.source) {
      match['source'] = queryParams.source
    }

    if (queryParams.collegeId) {
      if (_.isArray(queryParams.collegeId)) {
        match['college'] = { $in: queryParams.collegeId.map((id: string) => new ObjectId(id)) };
      } else {
        match['college'] = new ObjectId(queryParams.collegeId);
      }
    }

    if (queryParams.courseId) {
      if (_.isArray(queryParams.courseId)) {
        match['course'] = { $in: queryParams.courseId.map((id: string) => new ObjectId(id)) };
      } else {
        match['course'] = new ObjectId(queryParams.courseId);
      }
    }

    if (queryParams.departmentId) {
      if (_.isArray(queryParams.departmentId)) {
        match['department'] = { $in: queryParams.departmentId.map((id: string) => new ObjectId(id)) };
      } else {
        match['department'] = new ObjectId(queryParams.departmentId);
      }
    }

    if (queryParams.gender) {
      match['gender'] = queryParams.gender.toUpperCase();
    }

    if (queryParams.countryId) {
      match['country'] = new ObjectId(queryParams.countryId)
    }

    if (queryParams.stateId) {
      match['state'] = new ObjectId(queryParams.stateId)
    }

    if (queryParams.cityId) {
      match['city'] = new ObjectId(queryParams.cityId)
    }

    if (queryParams.staffId) {
      match['staff'] = new ObjectId(queryParams.staffId)
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

    if (queryParams.graduatedDateFrom && queryParams.graduatedDateTo) {
      match['monthAndYearOfPassingOut'] = {
        $gte: moment(queryParams.graduatedDateFrom),
        $lte: moment(queryParams.graduatedDateTo)
      }
    } else if (queryParams.graduatedDateFrom) {
      match['monthAndYearOfPassingOut'] = {
        $gte: moment(queryParams.graduatedDateFrom)
      }
    } else if (queryParams.graduatedDateTo) {
      match['monthAndYearOfPassingOut'] = {
        $lte: moment(queryParams.graduatedDateTo)
      }
    }

    const sortCriteria: any = {};
    if (queryParams.sortBy === 'firstName') {
      sortCriteria.firstName = queryParams.sort === 'asc' ? 1 : -1;
    } else {
      sortCriteria.createdAt = -1;
    }

    try {
      const userList = await this.UsersModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  countryName: "$countryName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'country'
          }
        },
        {
          $lookup: {
            from: 'states',
            localField: 'state',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  stateName: "$stateName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'state'
          }
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'city',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  cityName: "$cityName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'city'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'course'
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'department'
          }
        },
        {
          $lookup: {
            from: 'colleges',
            localField: 'college',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  collegeLogo: "$collegeLogo",
                  _id: 0
                }
              }
            ],
            as: 'college'
          }
        },
        {
          $lookup: {
            from: 'institutes',
            localField: 'instituteId',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  instituteLogo: "$instituteLogo",
                  _id: 0
                }
              }
            ],
            as: 'instituteId'
          }
        },
        {
          $lookup: {
            from: 'staffs',
            localField: 'staff',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  firstName: "$firstName",
                  id: "$_id",
                  lastName: "$lastName",
                  _id: 0
                }
              }
            ],
            as: 'staff'
          }
        },
        {
          $lookup: {
            from: "otps",
            let: { userEmail: "$email", userMobile: "$mobileNumber" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $and: [{ $eq: ["$email", "$$userEmail"] }, { $eq: ["$status", "VERIFIED"] }] },
                      { $and: [{ $eq: ["$mobileNumber", "$$userMobile"] }, { $eq: ["$status", "VERIFIED"] }] }
                    ]
                  }
                }
              },
              { $sort: { updatedAt: -1 } },
              { $limit: 1 },
              {
                $project: {
                  lastLoginTime: "$updatedAt",
                  _id: 0
                }
              }
            ],
            as: "loginInfo"
          }
        },
        {
          $lookup: {
            from: 'userprogressstatuses',
            localField: '_id',
            foreignField: 'userId',
            pipeline: [
              // Lookup units within userProgressStatus
              {
                $lookup: {
                  from: "units",
                  localField: "unitId",
                  foreignField: "_id",
                  as: "unitDetails"
                }
              },
              { $unwind: "$unitDetails" },
              { $addFields: { "unitDetails.displayOrderNum": { $toInt: "$unitDetails.displayOrder" } } },
              // Lookup modules within userProgressStatus
              {
                $lookup: {
                  from: "modules",
                  localField: "moduleId",
                  foreignField: "_id",
                  as: "moduleDetails"
                }
              },
              { $unwind: "$moduleDetails" },
              { $addFields: { "moduleDetails.displayOrderNum": { $toInt: "$moduleDetails.displayOrder" } } },
              // Sort by displayOrderNum in descending order
              { $sort: { "unitDetails.displayOrderNum": -1, "moduleDetails.displayOrderNum": -1 } },
              // Limit to get the highest displayOrder
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  unit: {
                    $ifNull: [
                      { $concat: ["Unit ", { $toString: "$unitDetails.displayOrder" }] },
                      "Not started"
                    ]
                  },
                  module: {
                    $ifNull: [
                      { $concat: ["Module ", { $toString: "$moduleDetails.displayOrder" }] },
                      "Not started"
                    ]
                  }
                }
              }
            ],
            as: 'userProgressStatus'
          }
        },
        {
          $unwind: { path: '$userProgressStatus', preserveNullAndEmptyArrays: true }
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$loginInfo', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$instituteId', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            id: "$_id"
          }
        },
        { $sort: sortCriteria },
        { $skip: skipValue },
        { $limit: limit }
      ]).exec();
      const count = await this.UsersModel.countDocuments(match).exec();
      return { userList, count };
    } catch (error) {
      throw new Error("An error occurred while fetching users.");
    }
  }

  async findAllUserUnderCollegeOutsite(queryParams: any, authId: string) {
    const staffDetails = await this.StaffModel.findById(authId).select('college').exec();
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    let match: any = { 
      $and: [
        { status: 'ACTIVE' },
        { college: staffDetails.college },
        // { source : "MOBILE"},
        { userType : "BASIC"}
      ]
    };
    const ObjectId = mongoose.Types.ObjectId;

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.promotedBy) {
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

      if (queryParams.promotedBy) {
        orCondition.push({
          promotedBy: new RegExp(`${queryParams.promotedBy}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match['status'] = queryParams.status
    }

    if (queryParams.userType) {
      match['userType'] = queryParams.userType
    }

    if (queryParams.source) {
      match['source'] = queryParams.source
    }

    if (queryParams.courseId) {
      if (_.isArray(queryParams.courseId)) {
        match['course'] = { $in: queryParams.courseId.map((id: string) => new ObjectId(id)) };
      } else {
        match['course'] = new ObjectId(queryParams.courseId);
      }
    }

    if (queryParams.departmentId) {
      if (_.isArray(queryParams.departmentId)) {
        match['department'] = { $in: queryParams.departmentId.map((id: string) => new ObjectId(id)) };
      } else {
        match['department'] = new ObjectId(queryParams.departmentId);
      }
    }

    if (queryParams.gender) {
      match['gender'] = queryParams.gender.toUpperCase();
    }

    if (queryParams.countryId) {
      match['country'] = new ObjectId(queryParams.countryId)
    }

    if (queryParams.stateId) {
      match['state'] = new ObjectId(queryParams.stateId)
    }

    if (queryParams.cityId) {
      match['city'] = new ObjectId(queryParams.cityId)
    }

    if (queryParams.staffId) {
      match['staff'] = new ObjectId(queryParams.staffId)
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

    if (queryParams.graduatedDateFrom && queryParams.graduatedDateTo) {
      match['monthAndYearOfPassingOut'] = {
        $gte: moment(queryParams.graduatedDateFrom),
        $lte: moment(queryParams.graduatedDateTo)
      }
    } else if (queryParams.graduatedDateFrom) {
      match['monthAndYearOfPassingOut'] = {
        $gte: moment(queryParams.graduatedDateFrom)
      }
    } else if (queryParams.graduatedDateTo) {
      match['monthAndYearOfPassingOut'] = {
        $lte: moment(queryParams.graduatedDateTo)
      }
    }

    const sortCriteria: any = {};
    if (queryParams.sortBy === 'firstName') {
      sortCriteria.firstName = queryParams.sort === 'asc' ? 1 : -1;
    } else {
      sortCriteria.createdAt = -1;
    }

    try {
      const userList = await this.UsersModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  countryName: "$countryName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'country'
          }
        },
        {
          $lookup: {
            from: 'states',
            localField: 'state',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  stateName: "$stateName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'state'
          }
        },
        {
          $lookup: {
            from: 'cities',
            localField: 'city',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  cityName: "$cityName",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'city'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'course'
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  _id: 0
                }
              }
            ],
            as: 'department'
          }
        },
        {
          $lookup: {
            from: 'colleges',
            localField: 'college',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  collegeLogo: "$collegeLogo",
                  _id: 0
                }
              }
            ],
            as: 'college'
          }
        },
        {
          $lookup: {
            from: 'institutes',
            localField: 'instituteId',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: "$name",
                  id: "$_id",
                  instituteLogo: "$instituteLogo",
                  _id: 0
                }
              }
            ],
            as: 'instituteId'
          }
        },
        {
          $lookup: {
            from: 'staffs',
            localField: 'staff',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  firstName: "$firstName",
                  id: "$_id",
                  lastName: "$lastName",
                  _id: 0
                }
              }
            ],
            as: 'staff'
          }
        },
        {
          $lookup: {
            from: "otps",
            let: { userEmail: "$email", userMobile: "$mobileNumber" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $and: [{ $eq: ["$email", "$$userEmail"] }, { $eq: ["$status", "VERIFIED"] }] },
                      { $and: [{ $eq: ["$mobileNumber", "$$userMobile"] }, { $eq: ["$status", "VERIFIED"] }] }
                    ]
                  }
                }
              },
              { $sort: { updatedAt: -1 } },
              { $limit: 1 },
              {
                $project: {
                  lastLoginTime: "$updatedAt",
                  _id: 0
                }
              }
            ],
            as: "loginInfo"
          }
        },
        {
          $lookup: {
            from: 'userprogressstatuses',
            localField: '_id',
            foreignField: 'userId',
            pipeline: [
              // Lookup units within userProgressStatus
              {
                $lookup: {
                  from: "units",
                  localField: "unitId",
                  foreignField: "_id",
                  as: "unitDetails"
                }
              },
              { $unwind: "$unitDetails" },
              { $addFields: { "unitDetails.displayOrderNum": { $toInt: "$unitDetails.displayOrder" } } },
              // Lookup modules within userProgressStatus
              {
                $lookup: {
                  from: "modules",
                  localField: "moduleId",
                  foreignField: "_id",
                  as: "moduleDetails"
                }
              },
              { $unwind: "$moduleDetails" },
              { $addFields: { "moduleDetails.displayOrderNum": { $toInt: "$moduleDetails.displayOrder" } } },
              // Sort by displayOrderNum in descending order
              { $sort: { "unitDetails.displayOrderNum": -1, "moduleDetails.displayOrderNum": -1 } },
              // Limit to get the highest displayOrder
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  unit: {
                    $ifNull: [
                      { $concat: ["Unit ", { $toString: "$unitDetails.displayOrder" }] },
                      "Not started"
                    ]
                  },
                  module: {
                    $ifNull: [
                      { $concat: ["Module ", { $toString: "$moduleDetails.displayOrder" }] },
                      "Not started"
                    ]
                  }
                }
              }
            ],
            as: 'userProgressStatus'
          }
        },
        {
          $unwind: { path: '$userProgressStatus', preserveNullAndEmptyArrays: true }
        },
        { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$city', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$loginInfo', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$instituteId', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            id: "$_id"
          }
        },
        { $sort: sortCriteria },
        { $skip: skipValue },
        { $limit: limit }
      ]).exec();
      const count = await this.UsersModel.countDocuments(match).exec();
      return { userList, count };
    } catch (error) {
      throw new Error("An error occurred while fetching users.");
    }
  }


  async findByEmail(email: string): Promise<User | null> {
    const user = await this.UsersModel.findOne({ email }).exec();
    return user || null;
  }


  async findById(id: string, authId: string, authRole: string): Promise<User> {
    if (authRole === 'STAFF') {
      try {//logging staff activities
        this.saveStaffActivity({
          staffId: authId,
          action: 'viewed_user',
          activity: 'Viewed User',
          usefullId: id,
          usefullIdFor: 'userid',
          reason: `Viewed user details.`
        }).then(() => { });
      } catch { }
    }
    if (authRole === 'ADMIN' || authRole === 'SUPER_ADMIN') {
      try {
        this.adminService.logAdminActivities({
          adminId: authId,
          action: 'viewed_user',
          activity: 'Viewed User',
          userId: id,
          usefullIdFor: 'userid',
          reason: `Viewed user details`
        }).then(() => { });
      } catch { }
    }

    if (authRole === 'USER') {
      try {
        this.logUserActivity({
          userId: id,
          activity: 'View account details.',
          action: 'viewed_account',
          shortDescription: 'Viewed account details.',
        }).then(() => { });
      } catch { }
    }

    const userDetails = await this.UsersModel.findById(id)
      .populate('country')
      .populate('state')
      .populate('city')
      .populate('course', 'id name abbreviation')
      .populate('department', 'id name abbreviation')
      .populate('college', 'id name collegeLogo')
      .populate('instituteId', 'id name instituteLogo')
      .exec();
    return userDetails;
  }

  async findUserProfileById(id: string) {
    const userDetails = await this.UsersModel.findById(id)
      .populate('country', 'id countryName countryCode')
      .populate('state', 'id stateName')
      .populate('city', 'id cityName')
      .populate('course', 'id name abbreviation')
      .populate('department', 'id name abbreviation')
      .populate('college', 'id name collegeLogo')
      .populate('instituteId', 'id name instituteLogo')
      .exec();
    return userDetails;
  }

  async findUserForInterviewerByUserId(userId: string) {
    const userDetails = await this.UsersModel.findById(userId)
      .select({
        id: 1, firstName: 1, lastName: 1, profileImage: 1, email: 1, dob: 1, gender: 1,
        monthAndYearOfPassingOut: 1, internship: 1, jobAspiration: 1
      })
      .populate('course', 'id name abbreviation')
      .populate('department', 'id name abbreviation')
      .populate('college', 'id name collegeLogo')
      .exec();
    return userDetails;
  }

  async findUserById(userId: string) {
    return this.UsersModel.findById(userId);
  }

  async findUserByReferralCode(referralCode: string) {
    return this.UsersModel.findOne({ referralCode: referralCode, status: { $ne: "DELETED" } });
  }

  async findUserRecentActiviy(userId: string) {
    return await this.userActivityModel.find({ userId: userId }).sort({ createdAt: -1 }).skip(1).limit(1);
  }

  async findAllUserActivies(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const ObjectId = mongoose.Types.ObjectId;
    const match: any = {};

    if (queryParams.userId) {
      match['userId'] = new ObjectId(queryParams.userId);
    }
    if (queryParams.unitId) {
      match['unitId'] = new ObjectId(queryParams.unitId);
    }
    if (queryParams.moduleId) {
      match['moduleId'] = new ObjectId(queryParams.moduleId);
    }

    let userMatch: any = {};

    if (queryParams.firstName || queryParams.lastName) {
      const orCondition = [];

      if (queryParams.firstName) {
        const splitValue = queryParams.firstName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const firstName = filteredArr[0];
        if (firstName) {
          orCondition.push({
            'user.firstName': new RegExp(`${firstName}`, 'i')
          });
        }
      }

      if (queryParams.lastName) {
        const splitValue = queryParams.lastName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const lastName = filteredArr[filteredArr.length - 1];
        if (lastName) {
          orCondition.push({
            'user.lastName': new RegExp(`${lastName}`, 'i')
          });
        }
      }
      userMatch = { $or: orCondition };
    }

    const activities = await this.userActivityModel.aggregate([
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
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
      { $match: { userId: { $ne: {} }, ...userMatch } },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      {
        $unwind: { path: '$unit', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'modules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module'
        }
      },
      {
        $unwind: { path: '$module', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          activity: 1,
          shortDescription: 1,
          action: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email',
            mobileNumber: '$user.mobileNumber',
            profileImage: '$user.profileImage'
          },
          unitId: {
            id: '$unit._id',
            unitName: '$unit.unitName',
            imageUrl: '$unit.imageUrl',
          },
          moduleId: {
            id: '$module._id',
            moduleName: '$module.moduleName',
            imageUrl: '$module.imageUrl',
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
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
      { $match: { userId: { $ne: {} }, ...userMatch } },
      { $count: 'total' }
    ];
    const countResult = await this.userActivityModel.aggregate(countPipeline).exec();
    const count = countResult.length > 0 ? countResult[0].total : 0;
    return { activities, count };
  }

  async findUserActivityById(userId: string, queryParams: { limit?: number; page?: number }) {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const skipValue = (page - 1) * limit;
    try {
      const userActivities = await this.userActivityModel
        .find({ userId: userId })
        .populate("userId", "id firstName lastName email mobileNumber profileImage")
        .populate("unitId", "id unitName imageUrl")
        .populate("moduleId", "id moduleName imageUrl")
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .exec();
      const count = await this.userActivityModel
        .countDocuments({ userId: userId });
      return { userActivities, count };
    } catch (error) {
      throw new Error(`Failed to find user activities: ${error.message}`);
    }
  }


  async findMyActivityById(userId: string, queryParams: { limit?: number; page?: number }) {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const skipValue = (page - 1) * limit;
    try {
      const userActivities = await this.userActivityModel
        .find({ userId: userId })
        .populate("userId", "id firstName lastName email mobileNumber profileImage")
        .populate("unitId", "id unitName imageUrl")
        .populate("moduleId", "id moduleName imageUrl")
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .exec();
      const count = await this.userActivityModel.countDocuments({ userId: userId });
      return { userActivities, count };
    } catch (error) {
      throw new Error(`Failed to find user activities: ${error.message}`);
    }
  }


  async findUserLearningProgressStatus(
    userId: string,
    queryParams: { limit?: number; page?: number }
  ) {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const skipValue = (page - 1) * limit;
    try {
      const userLearnings = await this.usersProgressStatusModel
        .find({ userId: userId })
        .populate('userId', 'id firstName lastName')
        .populate('unitId', 'id unitName')
        .populate('moduleId', 'id moduleName')
        .skip(skipValue)
        .limit(limit)
        .exec();
      const count = await this.usersProgressStatusModel.countDocuments({ userId: userId });
      return { userLearnings, count };
    } catch (error) {
      throw new Error(`Failed to find user learning progress status: ${error.message}`);
    }
  }

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

  async capturePayment(paymentDto: PaymentDto) {
    const { razorpay_payment_id } = paymentDto.paymentBody;
    const secretData = this.getSecret(paymentDto.mode);
    const instance = new Razorpay(secretData);
    const paymentData = await instance.payments.fetch(razorpay_payment_id);
    if (!paymentData) { // if not getting payment details
      return {
        status: "error",
        code: "3210"
      }
    }

    if (!paymentData?.amount) {
      return {
        status: "error",
        code: "3210"
      }
    }
    const capturedData = await instance.payments.capture(razorpay_payment_id, paymentData?.amount);
    if (!capturedData) {
      return {
        status: "error",
        code: "3210"
      }
    }

    if (!capturedData?.amount) {
      return {
        status: "error",
        code: "3210"
      }
    }
    return capturedData;
  }

  async handleGemPurchase(paymentDto: PaymentDto, userId: string, gemsToAdd: number, paymentData: any = null, amount?: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const userData = await this.UsersModel.findOneAndUpdate(
      { _id: userId },
      { $inc: { gemValue: gemsToAdd } },
      { new: true }
    ).exec();

    await this.gemsCountModel.create({
      gemValue: gemsToAdd,
    }).then(() => { });

    await this.userEarningsModel.create({//saving user earings while purchasing gems
      userId: userId,
      activity: "Purchased gems",
      action: "purchased_gems",
      reason: 'Purchased gems',
      gemValue: gemsToAdd,
      xpValue: null,
      megathilValue: null,
      earnedOrSpent: 'PURCHASED',
      refNumber: paymentDto?.paymentBody?.responseBody?.metadata?.payment_id,
    }).then(() => { });

    await this.transactionModel.create({
      item: "GEMS",
      quantity: gemsToAdd,
      userId: userId,
      refNumber: paymentData?.id || paymentDto?.paymentBody?.purchaseID,
      payment: amount || paymentDto.paymentBody.rawPrice,
      reason: `Gems purchased. ${gemsToAdd} added to for ${amount || paymentDto?.paymentBody?.rawPrice} of payment.`,
      paymentResponse: paymentData || paymentDto.paymentBody,
      status: paymentDto?.status
    }).then(() => { });

    this.awardGemsForReferral(userId);
    // To get user name and email using userId to sent email once that purchanse success
    const aggregationResult = await this.UsersModel.aggregate([
      {
        $match: { _id: new ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
          email: '$userDetails.email',
        },
      },
    ]);

    // email sent once purchase is success
    const sendEmail = process.env.SEND_EMAIL;
    if (sendEmail && sendEmail === 'true' && aggregationResult?.length > 0) {
      try {
        const templateData = {
          "name": `${aggregationResult[0].firstName} ${aggregationResult[0].lastName}`,
          "message": "Awesome news! You’ve just unlocked Premium on Megathil! Get ready to take your interview learning to the next level!",
          "gemValue": `${gemsToAdd}`,
          "amount": `${amount || paymentDto?.paymentBody?.rawPrice}`
        }
        await this.emailService.sendMail(
          aggregationResult[0].email,
          "Welcome to Our Service",
          "USERPURCHASE",
          templateData
        ).then(() => { })
      } catch {
        console.log('not send')
      }
    }
    return { status: 'success', code: '3208', data: userData }
  }


  async userGemsPurchase(paymentDto: PaymentDto, userId: string) {
    if (paymentDto.status === "SUCCESS") {
      if (!paymentDto.paymentMethod || paymentDto.paymentMethod === "RAZORPAY") {
        const paymentData = await this.capturePayment(paymentDto);

        if (paymentData.status === 'captured') {
          const amount = Number(paymentData?.amount) / 100;

          const gemsToAdd = 2000; 
          return await this.handleGemPurchase(paymentDto, userId, gemsToAdd, paymentData, amount);
        }
        await this.transactionModel.create({
          item: "GEMS",
          quantity: null,
          userId: userId,
          refNumber: paymentData?.id,
          payment: null,
          reason: 'Payment verification was not successful',
          paymentResponse: paymentData,
          status: paymentData.status
        }).then(() => { });
        return { status: 'success', code: '3210' }
      }
      else if (paymentDto.paymentMethod === "INAPPPURCHASE") {
        let gemsToAdd: any;
        if (paymentDto.paymentFor === "UNIT") {
          gemsToAdd = 2000;
        } else if (paymentDto.paymentFor === "INTERVIEW") {
          gemsToAdd = 2000;
        }
        return await this.handleGemPurchase(paymentDto, userId, gemsToAdd);
      }
    }

    if (paymentDto.status !== "SUCCESS") {
      await this.transactionModel.create({
        item: "GEMS",
        quantity: null,
        userId: userId,
        refNumber: paymentDto?.paymentBody?.responseBody?.metadata?.payment_id || paymentDto?.paymentBody?.purchaseID,
        payment: null,
        reason: paymentDto?.paymentBody?.responseBody?.description || paymentDto?.paymentBody?.description,
        paymentResponse: paymentDto.paymentBody,
        status: paymentDto.status
      }).then(() => { });
      return { status: 'success', code: '3210' }
    }
  }

  purchasePayload(gemsPackage: any, paymentData: any, userId: string, paymentDto: PaymentDto) {
    return {
      item: "GEMS",
      quantity: gemsPackage.gems,
      userId: userId,
      refNumber: paymentData?.id,
      payment: gemsPackage.gemsPrice,
      reason: "Gems purchased. Package name: " + gemsPackage.packageName + "(id:" + gemsPackage._id + ")",
      paymentResponse: paymentData,
      status: paymentDto?.status
    }
  }

  // using then catch instead of async await. so that any error occurs here wont affect payment flow.
  awardGemsForReferral(userId: string) {
    // 10 gems will be awarded for each referrals
    this.UsersModel.findOne({ _id: userId }).then((user: any) => {
      if (user.appliedReferralCode && !user.referralRewared) {
        this.UsersModel.findOneAndUpdate({ referralCode: user.appliedReferralCode }, { $inc: { gemValue: 10 } })
          .then(() => {
            this.userEarningsModel.create({//saving user earings for referral earnings
              userId: userId,
              activity: "Bonus gems",
              action: "referral_gems",
              reason: 'Bonus gems for referring a user to Megatil.',
              gemValue: 10,
              xpValue: null,
              megathilValue: null,
              earnedOrSpent: 'AWARDED',
            }).then(() => { });

            this.transactionModel.create({//saving transaction for referral earnings
              item: "GEMS",
              quantity: 10,
              userId: userId,
              refNumber: null,
              payment: null,
              reason: 'Awarded gems for referring a user to Megatil.',
              status: 'SUCCESS'
            }).then(() => { });
          }).catch((e) => console.log("Error#", e));
      }
    }).catch((e) => console.log("Error#", e));
  }

  async update(id: string, updatedUserDto: UpdatedUserDto, authId: string, authRole: string): Promise<User> {
    if (!_.isEmpty(updatedUserDto.email)) {

      if (authRole === 'USER') {
        try {
          this.logUserActivity({
            userId: id,
            activity: 'Updated profile details.',
            action: 'updated_profile',
            shortDescription: 'Updated profile details.',
          }).then(() => { });
        } catch { }
      } else if (authRole === 'STAFF') {
        try {//logging staff activities
          this.saveStaffActivity({
            staffId: authId,
            action: 'updated_user_profile',
            activity: 'Updated user profile',
            usefullId: id,
            usefullIdFor: 'userid',
            reason: `Updated ${updatedUserDto.firstName} details.`
          }).then(() => { });
        } catch { }
      } else if (authRole === 'ADMIN' || authRole === 'SUPER_ADMIN') {
        try {
          this.adminService.logAdminActivities({
            adminId: authId,
            action: 'updated_user_profile',
            activity: 'Updated user profile',
            userId: id,
            usefullIdFor: 'userid',
            reason: `Updated ${updatedUserDto.firstName} details.`
          }).then(() => { });
        } catch { }
      }

      try {
        const filteredUserDto = Object.entries(updatedUserDto)
          .filter(([key, value]) => {
            return !(
              (value === '' || value === null) &&
              ['country', 'state', 'city', 'course', 'department', 'college'].includes(key)
            );
          })
          .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {});
        this.initiateUserProgressStatus(id).then(() => { });
        this.initiateOrUpdateUserUnitStatus(id).then(() => { });
        const result = await this.UsersModel.findOneAndUpdate(
          { _id: id },
          { ...filteredUserDto, isExistUser: true },
          { new: true }
        ).exec();
        if (authRole === 'STAFF') {
          try {//logging staff activities
            this.saveStaffActivity({
              staffId: authId,
              action: 'updated_user',
              activity: 'Updated User',
              usefullId: id,
              usefullIdFor: 'userid',
              reason: `Updated user details.`
            }).then(() => { });
          } catch { }
        }
        return result;
      } catch (error) {
        throw error;
      }
    } else {
      return this.UsersModel.findOneAndUpdate({ _id: id }, updatedUserDto).exec();
    }
  }


  async updateUserModel(id: string, updatedUserDto: any): Promise<User> {
    const sanitizedData = removeNullNodes(updatedUserDto);

    const finalDataToUpdate = { ...sanitizedData };

    if (updatedUserDto.email) { // user updating email means profile completed
      finalDataToUpdate['isExistUser'] = true;
    }

    return await this.UsersModel.findByIdAndUpdate(
      id,
      finalDataToUpdate,
      { new: true, runValidators: true }
    ).exec();
  }

  async delete(id: string, auth: any): Promise<User> {
    const random = Math.floor(Math.random() * 100000000);
    const user = await this.UsersModel.findById(id);
    if(user.userType === "PREMIUM"){
      await this.collegeModel.updateOne({ _id: user.college }, { $inc: { premiumUserAlloted: 1, premiumUserUtilized: -1 } });
    }
    const deletedUser = await this.UsersModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED', mobileNumber: `deleted_${random}_${user.mobileNumber}`, email: `deleted_${random}_${user.email}` } },
        { new: true }
      )
      .lean()
      .exec();
    if (auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN') {
      try {
        this.adminService.logAdminActivities({
          adminId: auth.id,
          action: 'deleted_user',
          activity: 'Deleted User',
          userId: id,
          usefullIdFor: 'userid',
          reason: `delete user details.`
        }).then(() => { });
      } catch { }
    }
    return deletedUser
  }

  async adminLogin(req: any) {
    const user: any = await this.UsersModel.findOne({ email: req.email }).populate('role');
    if (!user) {
      return false;
    }
    if (user.role.role === VALIDATE_USER.ADMIN || VALIDATE_USER.SUPER_ADMIN) {
      return user;
    } else {
      return false
    }
  }

  async userLogin(req: any, code: number) {
    code = 1234;
    const otpNumber = await this.OtpModel.findOne({
      mobileNumber: req.mobileNumber,
      status: 'ACTIVE',
    });
    if (otpNumber) {
      const data = await this.OtpModel.findOneAndUpdate(
        { mobileNumber: req.mobileNumber },
        { new: true, upsert: true }
      );
      return data;
    } else {
      const userLogin = {
        otp: code,
        mobileNumber: req.mobileNumber,
        deviceId: req.deviceId,
        type: "NEW",
        status: 'ACTIVE',
      };
      const newData = new this.OtpModel(userLogin);
      return await newData.save();
    }
  }

  async sentOTP(mobileCode: string, mobileNumber: string, otp: string) {
    const sender = 'MEGTHL'; // Sender name
    const expireTime = await this.systemVariablesModel.findOne({ name: 'OTP_EXPIRE_TIME_MINS' });
    const expireIn = expireTime && expireTime.value ? expireTime.value : 10; // 10 default expire time in mins.
    // Message details
    const numbers = [mobileNumber]; // Array of recipient numbers
    if (mobileCode === '+91' || !mobileCode) {
      const message = encodeURIComponent(`Login OTP for Megathil is ${otp}. OTP will expire in ${expireIn} mins.`);
      const apiKey = encodeURI(process.env.SMS_API_TOKEN);
      const smsUrl = `${process.env.SMS_API_ENDPOINT}?apiKey=${apiKey}&sender=${sender}&message=${message}&numbers=${numbers.join(',')}`;
      // Send the POST request using Axios
      return await axios.post(smsUrl);
    } else {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      const twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
      const otpOnlyMessage = `Your OTP is: ${otp}`;
      try {
        const resp = await twilioClient.messages.create({
          body: otpOnlyMessage,
          from: twilioPhoneNumber,
          to: `${mobileCode}${mobileNumber}`,
        });
        const formattedResponse = {
          body: resp.body,
          status: resp.status,
          sid: resp.sid,
          from: resp.from,
          to: resp.to,
          dateCreated: resp.dateCreated,
          dateUpdated: resp.dateUpdated,
          errorMessage: resp.errorMessage,
          price: resp.price,
          numSegments: resp.numSegments,
        };
        return { data: formattedResponse };
      } catch (error) {
        throw new Error('Error sending OTP via Twilio');
      }
    }
  }

  async generateUserOtp(loginDto: LoginDto) {
    const systemVariables = await this.systemVariablesModel.find({ status: 'ACTIVE' });
    let generatedOTP = ''; // OTP is static until msg service implementation
    let assignDefaultOtp: boolean = false;
    let smsResponse: any;
    // get user record
    if(!_.isEmpty(loginDto.email)){
      const userData = await this.UsersModel.findOne({ email: loginDto.email, status: { $ne: 'DELETED' } });
      if (userData && userData?.status === "INACTIVE") {
        return 'INACTIVE';
      }
      if (!_.isEmpty(userData)) {
        const validateDeviceId = systemVariables.find((item) => item.name === "VALIDATE_DEVICE_ID");
        if (validateDeviceId && validateDeviceId.value === 'YES') {
          if (userData.deviceId && userData.deviceId !== 'abcdef123456' && loginDto.deviceId !== userData.deviceId) {
            return 'LOGIN_FROM_DIFFERENT_DEVICE';
          } else if (!userData.deviceId && loginDto.deviceId) {
            this.UsersModel.updateOne({ _id: userData.id }, { deviceId: loginDto.deviceId, device: loginDto.device }).then(() => { }).catch(() => { })
          }
        }
      }

      
      const defaultOtpMail = systemVariables.find((item) => item.name === "DEFAULT_OTP_EMAIL");

      const defaultMail = defaultOtpMail && defaultOtpMail.value ? defaultOtpMail.value.split(",") : [];

      if (defaultMail && defaultMail.length && defaultMail.includes(loginDto.email)) {
        assignDefaultOtp = true;
      } else if (_.isEmpty(defaultMail && defaultMail.length)) {
        const sendEmail = process.env.SEND_EMAIL;
        if (sendEmail && sendEmail === 'true') {
          generatedOTP = String(Math.floor(1000 + Math.random() * 9000));
          try {
            const templateData = {
              "otp": `${generatedOTP.toString()}`,
            }
            await this.emailService.sendMail(
              loginDto.email,
              "Verify your identity",
              "USER_LOGIN",
              templateData
            ).then(() => { })
          } catch (e) {
              return 'OTP_FAILED';
           }
        }
      } else {
        assignDefaultOtp = true;
      }
  
      if (assignDefaultOtp) {
        const defaultOtp = systemVariables.find((item) => item.name === "DEFAULT_OTP");
        generatedOTP = defaultOtp.value;
      }
  
      await new this.OtpModel({
        email: loginDto.email,
        otp: generatedOTP.toString(),
        deviceId: loginDto.deviceId,
        status: 'PENDING',
      }).save();
    } else if (!_.isEmpty(loginDto.mobileNumber)){
      const userData = await this.UsersModel.findOne({ mobileNumber: loginDto.mobileNumber, status: { $ne: 'DELETED' } });
    if (userData && userData?.status === "INACTIVE") {
      return 'INACTIVE';
    }
    if (!_.isEmpty(userData)) {
      if (userData.mobileCode && loginDto.mobileCode && userData.mobileCode !== loginDto.mobileCode) {
        return 'INCORRECT_MOBILECODE'
      }

      if (userData && !userData.mobileCode) {
        userData.mobileCode = '+91';
        await this.UsersModel.updateOne({ _id: userData.id }, { mobileCode: '+91' });
      }
    }

    if (!_.isEmpty(userData)) {
      const validateDeviceId = systemVariables.find((item) => item.name === "VALIDATE_DEVICE_ID");
      if (validateDeviceId && validateDeviceId.value === 'YES') {
        if (userData.deviceId && userData.deviceId !== 'abcdef123456' && loginDto.deviceId !== userData.deviceId) {
          return 'LOGIN_FROM_DIFFERENT_DEVICE';
        } else if (!userData.deviceId && loginDto.deviceId) {
          this.UsersModel.updateOne({ _id: userData.id }, { deviceId: loginDto.deviceId, device: loginDto.device }).then(() => { }).catch(() => { })
        }
      }
    }

    const defaultOtpNos = systemVariables.find((item) => item.name === "DEFAULT_OTP_MOB_NOS");

    const defaultNos = defaultOtpNos && defaultOtpNos.value ? defaultOtpNos.value.split(",") : [];

    const otpEnabled = systemVariables.find((item) => item.name === "SENT_OTP");

    if (defaultNos && defaultNos.length && defaultNos.includes(loginDto.mobileNumber)) {
      assignDefaultOtp = true;
    } else if (otpEnabled && otpEnabled.value === 'YES') {
      generatedOTP = String(Math.floor(1000 + Math.random() * 9000)); // PRODCHANGE
      const restult = await this.sentOTP(loginDto.mobileCode, loginDto.mobileNumber, generatedOTP.toString());
      smsResponse = restult.data;
      if (smsResponse?.data?.status === 'failure') {
        return 'OTP_FAILED';
      }
    } else {
      assignDefaultOtp = true;
    }

    if (assignDefaultOtp) {
      const defaultOtp = systemVariables.find((item) => item.name === "DEFAULT_OTP");
      generatedOTP = defaultOtp.value;
    }

    await new this.OtpModel({
      mobileCode: loginDto.mobileCode,
      mobileNumber: loginDto.mobileNumber,
      otp: generatedOTP.toString(),
      deviceId: loginDto.deviceId,
      status: 'PENDING',
      smsResponse: smsResponse
    }).save();
    } else {
      return 'FAILED'
    }
    return 'SUCCESS';
  }

  async validateUserOtp(otpDto: OtpDto) {
    const systemVariables = await this.systemVariablesModel.find({ status: 'ACTIVE' });
    if (!_.isEmpty(otpDto.email)) {
      if (!otpDto.email) { // if email not present
        console.log("Validate OTP: email not found.");
        return false;
      }
  
      if (!otpDto.otp) {// if otp not present
        console.log("Validate OTP: otp not found.");
        return false;
      }
      if (!_.isEmpty(otpDto.promotedCode)) {
        const promoCodeData: any[] = await this.PromoCodeModel.find({ promotedCode: otpDto.promotedCode, status: 'ACTIVE' }).limit(1).sort({ createdAt: -1 });
        if (!promoCodeData.length) { // if promoted code is invalid
          return { status: 'PROMOCODE_INVALID'};
        }
      }
      const defaultOtpMail = systemVariables.find((item) => item.name === "DEFAULT_OTP_EMAIL");

      const defaultMail = defaultOtpMail && defaultOtpMail.value ? defaultOtpMail.value.split(",") : [];

      const existingUserData = await this.UsersModel.findOne({ email: otpDto.email, status: 'ACTIVE' }).select('firstName').exec();
       if(!_.isEmpty(otpDto.promotedCode) && !_.isEmpty(existingUserData && existingUserData.firstName) && !(defaultMail && defaultMail.length && defaultMail.includes(otpDto.email))) { 
          // if user is existing apply promocode not applicable
          return { status: 'PROMOCODE_ONLY_APPLICABLE_NEW_MEMBER' };
      }
      const userData = await this.UsersModel.findOne({ email: otpDto.email, status: { $ne: 'DELETED' } });
      if (userData && userData?.status === "INACTIVE") { // if user is inactive
        return { status: 'INACTIVE' };
      }
      const otpData: any[] = await this.OtpModel.find({ email: otpDto.email, status: 'PENDING' }).limit(1).sort({ createdAt: -1 });
      if (!otpData.length) {// if email not present in otp table
        return false;
      }
      const expireTime = moment.utc(otpData[0]?.createdAt).add(10, 'minutes');
      const currentTime = moment.utc();

      if (currentTime.isAfter(expireTime)) { // otp expired
        this.OtpModel.updateOne({ _id: otpData[0]._id }, { status: 'EXPIRED' }).then(() => { });
        return { status: 'OTP_EXPIRED'};
      }

      if (otpData[0].otp !== otpDto.otp) { // if otp is invalid
        return { status: 'INVALID_OTP'};
      }

      this.OtpModel.updateOne({ _id: otpData[0]._id }, { status: 'VERIFIED' }).then(() => { });

      if (!userData) {// user not present or deleted already
        const becameMember = await this.achievementsModel.findOne({ keyName: 'BECOME_MEMBER' });

        const newUserPayload: any = { // saving as new user
          email: otpDto.email,
          deviceId: otpDto.deviceId,
          device: otpDto.device,
          deviceToken: otpDto.deviceToken,
          deviceInfo: otpDto.deviceInfo,
          isExistUser: false,
          gemValue: becameMember.gemValue,
          xpValue: becameMember.xpValue,
          megathilPoints: becameMember.megathilPoints,
          status: 'ACTIVE',
          source: 'MOBILE',
          referralCode: generateReferralCode(),
          promotedBy: otpDto.promotedCode
        };
        if (otpDto.deviceToken) {
          newUserPayload.deviceToken = otpDto.deviceToken;
        }
        if (otpDto.deviceInfo) {
          newUserPayload.deviceInfo = otpDto.deviceInfo;
        }
        if (otpDto.promotedCode) {
          newUserPayload.promotedBy = otpDto.promotedCode;
        }

        const newUser = await this.UsersModel.create(newUserPayload);
        this.userEarningsModel.create({//saving user earings while creating user
          userId: newUser._id.toString(),
          activity: "Bonus gems",
          action: "registered",
          reason: 'Bonus gems for becoming a Megathil user.',
          gemValue: becameMember.gemValue,
          xpValue: becameMember.xpValue,
          megathilValue: becameMember.megathilPoints,
          earnedOrSpent: 'AWARDED',
        }).then(() => { });

        this.transactionModel.create({//saving transaction while creating user
          item: "GEMS",
          quantity: becameMember.gemValue,
          userId: newUser._id,
          refNumber: null,
          payment: null,
          reason: 'Awarded gems as the welcome bonus.',
          status: 'SUCCESS'
        }).then(() => { });

        this.logUserActivity({
          userId: newUser._id.toString(),
          activity: "Become User",
          action: "become_user",
          shortDescription: 'become user',
        }).then(() => { });

        this.LoginHistoryModule.create({
          userId: newUser._id,
          loginTime: moment.utc(),
          status: 'ACTIVE'
        }).then(() => { });

        this.initiateUserProgressStatus(newUser.id).then(() => { });
        this.initiateOrUpdateUserUnitStatus(newUser.id).then(() => { });
        return newUser
      }


      if (userData && userData._id) { // user already exist for mobile number
        this.checkExistingUserUnitTwoStatus(userData._id).then(() => { });
        this.LoginHistoryModule.create({
          userId: userData._id,
          loginTime: moment.utc(),
          status: 'ACTIVE'
        }).then(() => { });

        this.logUserActivity({
          userId: userData._id.toString(),
          activity: "Logged In",
          action: "logged_in",
          shortDescription: 'logged in',
        }).then(() => { });

        await this.updateUserDeviceDetails(otpDto, userData._id.toString()); // update device info while verify otp

        if (userData.firstName) { // user updating firstName means profile completed
          return await this.UsersModel
            .findOneAndUpdate({ _id: userData._id }, {
              isExistUser: true,
              deviceId: otpDto.deviceId,
              device: otpDto.device
            }, { new: true })
            .exec();
        }

        return await this.UsersModel
          .findOneAndUpdate({ _id: userData._id }, { isExistUser: false }, { new: true })
          .exec();
      }
    } else if (!_.isEmpty(otpDto.mobileNumber)) {
      if (!otpDto.mobileNumber) { // if mobile number not present
        console.log("Validate OTP: mobile number not found.");
        return false;
      }
  
      if (!otpDto.otp) {// if otp not present
        console.log("Validate OTP: otp not found.");
        return false;
      }

      if (!_.isEmpty(otpDto.promotedCode)) {
        const promoCodeData: any[] = await this.PromoCodeModel.find({ promotedCode: otpDto.promotedCode, status: 'ACTIVE' }).limit(1).sort({ createdAt: -1 });
        if (!promoCodeData.length) { // if promoted code is invalid
          return { status: 'PROMOCODE_INVALID'};
        }
      }

      const existingUserData = await this.UsersModel.findOne({ mobileNumber: otpDto.mobileNumber, status: 'ACTIVE' }).select('firstName').exec();
      if (!_.isEmpty(otpDto.promotedCode) && !_.isEmpty(existingUserData && existingUserData.firstName)) { // if user is existing apply promocode not applicable
        return { status: 'PROMOCODE_ONLY_APPLICABLE_NEW_MEMBER' };
      }
  
      const userData = await this.UsersModel.findOne({ mobileNumber: otpDto.mobileNumber, status: { $ne: 'DELETED' } });
      if (userData && userData?.status === "INACTIVE") { // if user is inactive
        console.log("Validate OTP: user inactive:", userData.mobileNumber);
        return { status: 'INACTIVE' };
      }
  
      if (userData && otpDto.mobileCode && userData.mobileCode && userData.mobileCode !== otpDto.mobileCode) {
        console.log("Validate OTP: incorrect mobile code:", otpDto.mobileCode);
        return false;
      }
  
      const otpData: any[] = await this.OtpModel.find({ mobileNumber: otpDto.mobileNumber, status: 'PENDING' }).limit(1).sort({ createdAt: -1 });
      if (!otpData.length) {// if mobile number not present in otp table
        console.log("Validate OTP: pending otp not found in table:", userData.mobileNumber);
        return false;
      }
  
      if (otpData[0].mobileCode !== otpDto.mobileCode) {
        console.log("Validate OTP: Incorrect mobile code:", otpDto.mobileCode);
        return { status: 'FAILED', message: "Mobile code mismatch." };
      }
  
      const expireTime = moment.utc(otpData[0]?.createdAt).add(10, 'minutes');
      const currentTime = moment.utc();
  
      if (currentTime.isAfter(expireTime)) { // otp expired
        console.log("Validate OTP: otp expired:", userData.mobileNumber);
        this.OtpModel.updateOne({ _id: otpData[0]._id }, { status: 'EXPIRED' }).then(() => { });
        return { status: 'OTP_EXPIRED'};
      }
  
      if (otpData[0].otp !== otpDto.otp) { // if otp is invalid
        console.log("Validate OTP: invalid otp:", userData.mobileNumber);
        return { status: 'INVALID_OTP'};
      }
  
      this.OtpModel.updateOne({ _id: otpData[0]._id }, { status: 'VERIFIED' }).then(() => { });
  
      if (!userData) {// user not present or deleted already
        const becameMember = await this.achievementsModel.findOne({ keyName: 'BECOME_MEMBER' });
  
        const newUserPayload: any = { // saving as new user
          mobileNumber: otpDto.mobileNumber,
          deviceId: otpDto.deviceId,
          device: otpDto.device,
          deviceToken: otpDto.deviceToken,
          deviceInfo: otpDto.deviceInfo,
          isExistUser: false,
          gemValue: becameMember.gemValue,
          xpValue: becameMember.xpValue,
          megathilPoints: becameMember.megathilPoints,
          status: 'ACTIVE',
          source: 'MOBILE',
          referralCode: generateReferralCode(),
          mobileCode: otpDto.mobileCode,
          promotedBy: otpDto.promotedCode
        };
        if (otpDto.deviceToken) {
          newUserPayload.deviceToken = otpDto.deviceToken;
        }
        if (otpDto.deviceInfo) {
          newUserPayload.deviceInfo = otpDto.deviceInfo;
        }
        if (otpDto.mobileCode) {
          newUserPayload.mobileCode = otpDto.mobileCode;
        }
        if (otpDto.promotedCode) {
          newUserPayload.promotedBy = otpDto.promotedCode;
        }
  
        const newUser = await this.UsersModel.create(newUserPayload);
        this.userEarningsModel.create({//saving user earings while creating user
          userId: newUser._id.toString(),
          activity: "Bonus gems",
          action: "registered",
          reason: 'Bonus gems for becoming a Megathil user.',
          gemValue: becameMember.gemValue,
          xpValue: becameMember.xpValue,
          megathilValue: becameMember.megathilPoints,
          earnedOrSpent: 'AWARDED',
        }).then(() => { });
  
        this.transactionModel.create({//saving transaction while creating user
          item: "GEMS",
          quantity: becameMember.gemValue,
          userId: newUser._id,
          refNumber: null,
          payment: null,
          reason: 'Awarded gems as the welcome bonus.',
          status: 'SUCCESS'
        }).then(() => { });
  
        this.logUserActivity({
          userId: newUser._id.toString(),
          activity: "Become User",
          action: "become_user",
          shortDescription: 'become user',
        }).then(() => { });
  
        this.LoginHistoryModule.create({
          userId: newUser._id,
          loginTime: moment.utc(),
          status: 'ACTIVE'
        }).then(() => { });
  
        this.initiateUserProgressStatus(newUser.id).then(() => { });
        this.initiateOrUpdateUserUnitStatus(newUser.id).then(() => { });
        return newUser
      }
  
  
      if (userData && userData._id) { // user already exist for mobile number
        this.checkExistingUserUnitTwoStatus(userData._id).then(() => { });
        this.LoginHistoryModule.create({
          userId: userData._id,
          loginTime: moment.utc(),
          status: 'ACTIVE'
        }).then(() => { });
  
        this.logUserActivity({
          userId: userData._id.toString(),
          activity: "Logged In",
          action: "logged_in",
          shortDescription: 'logged in',
        }).then(() => { });
  
        await this.updateUserDeviceDetails(otpDto, userData._id.toString()); // update device info while verify otp
  
        if (userData.firstName) { // user updating firstName means profile completed
          return await this.UsersModel
            .findOneAndUpdate({ _id: userData._id }, {
              isExistUser: true,
              deviceId: otpDto.deviceId,
              device: otpDto.device
            }, { new: true })
            .exec();
        }
  
        return await this.UsersModel
          .findOneAndUpdate({ _id: userData._id }, { isExistUser: false }, { new: true })
          .exec();
      }
    } else {
      return false;
    }
  }

  async checkExistingUserUnitTwoStatus(userId: any) {
    const units = await this.unitModel.find({ status: 'ACTIVE' });
    const unitTwo: any[] = units.filter((i) => i.displayOrder == '2');
    if (unitTwo && unitTwo.length > 0) {
      const unit2Status = await this.usersUnitStatusModel.findOne({
        unitId: unitTwo[0]._id,
        userId: userId
      });
      if (unit2Status && unit2Status.unlocked) {
        await this.UsersModel.updateOne(
          { _id: userId },
          { $set: { allowMockInterview: true } }
        );
      }
    }
  }

  // add userAwardGems
  async saveUserAwardGems(userAwardGemsDto: any, value: any, awardedBy: string) {
    try {
      const awarded = await this.UsersModel
        .findOneAndUpdate({ _id: userAwardGemsDto.userId }, { $inc: { gemValue: value } }, { new: true })
        .exec();

      this.userEarningsModel.create({
        userId: userAwardGemsDto.userId,
        activity: "Gems awarded",
        action: "gems_awared",
        reason: 'Gems awarded by ' + awardedBy,
        gemValue: value,
        xpValue: null,
        megathilValue: null,
        earnedOrSpent: 'AWARDED',
      }).then(() => { });

      this.transactionModel.create({
        item: "GEMS",
        quantity: value,
        userId: userAwardGemsDto.userId,
        refNumber: null,
        payment: null,
        reason: 'Gems awarded by ' + awardedBy,
        status: 'SUCCESS'
      }).then(() => { });

      return awarded;
    } catch (error) {
      throw new Error();
    }
  }

  async findAllUserEarnings(queryParams: any, userId: string) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const ObjectId = mongoose.Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const match: any = { userId: userObjectId }
    if (queryParams.status) {
      match['earnedOrSpent'] = queryParams.status
    }
    match.gemValue = { $gt: 0 };
    try {
      const userEarningsList = await this.userEarningsModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .populate('unitId', 'id unitName')
        .populate('moduleId', 'id moduleName')
        .exec();
      const count = await this.userEarningsModel.countDocuments(match).exec();
      return { userEarningsList, count };
    } catch (error) {
      throw new Error("An error occurred while fetching users.");
    }
  }

  async logUserActivity(params: Partial<UserActivity>) {
    const activity = new this.userActivityModel(params);
    return activity.save();
  }

  async saveStaffActivity(staffActivitiesDto: StaffActivitiesDto) {
    return await this.staffActivitiesModel.create(staffActivitiesDto);
  }

  async initiateUserProgressStatus(userId: string) {
    const unit = await this.unitModel.findOne({ displayOrder: '1' });
    const module = await this.moduleModel.findOne({ unitId: unit.id, displayOrder: "1" });
    const questions = await this.questionModel.find({ moduleId: module.id }).populate('questionType', 'id displayName displayValue').sort({ displaOrder: 1 }).exec();

    const instructionsCount = questions.filter((i: any) => i.questionType.displayValue === 'moduleInstruction').length;
    const questionsCount = questions.filter((i: any) => i.questionType.displayValue === 'Modulequestions').length;

    // preparing user learning status data
    const userProgressStatusDto: UserProgressStatusDto = {
      userId: new mongoose.Types.ObjectId(userId),
      unitId: new mongoose.Types.ObjectId(unit.id),
      moduleId: new mongoose.Types.ObjectId(module.id),
      currentQuestionId: new mongoose.Types.ObjectId(questions[0].id),
      completedInstructionsCount: 0,
      totalInstructionsCount: instructionsCount,
      completedQuestionsCount: 0,
      totalQuestionsCount: questionsCount,
      completedCount: 0,
      totalCount: instructionsCount + questionsCount,
      completedPercentage: 0,
      instructionIds: [],
      questionIds: [],
      completedInstructionIds: [],
      completedQuestionIds: [],
      status: 'NOT_STARTED',
      parentOptionId: ''
    };
    return await this.usersProgressStatusModel.create(userProgressStatusDto);
  }

  async initiateOrUpdateUserUnitStatus(userId: string) {
    const units = await this.unitModel.find({ status: 'ACTIVE' });
    if (units && units.length) {
      const unitStatusData = units.map((unit) => {
        return {
          userId: userId, unitId: unit.id, unlocked: false
        }
      });
      const unitOne: any[] = units.filter((i) => i.displayOrder == '1');
      if (unitOne && unitOne.length) {
        const index = unitStatusData.findIndex((item) => item.unitId == unitOne[0].unitId);
        unitStatusData[index].unlocked = true;
      }
      unitStatusData.map(async (item) => {
        const exist = await this.usersUnitStatusModel.findOne({ userId: item.userId, unitId: item.unitId });
        if (!exist) {
          await this.usersUnitStatusModel.create(item);
        }
      });
      return true;
    }
    return false;
  }

  async unlockUnitForUser(unitId: string, userId: string) {
    // checking if unit is already unlocked
    const unitStatus = (await this.usersUnitStatusModel.findOne({ unitId: unitId, userId: userId })).unlocked;
    if (unitStatus) {
      return { status: 'error', code: '4301' };
    }

    //checking if user having enough gems to unlock unit
    const userGemValue = (await this.UsersModel.findById(userId)).gemValue;
    const unit = await this.unitModel.findById(unitId);
    const unlockCostInGems = unit?.unlockCostInGems || 100;

    if (userGemValue < unlockCostInGems) {
      return { status: 'error', code: '4300' };
    }

    // unlocking unit for user
    await this.usersUnitStatusModel.updateOne({ unitId: unitId, userId: userId }, { unlocked: true });

    await this.UsersModel.updateOne({ _id: userId }, { gemValue: userGemValue - unlockCostInGems });

    const units = await this.unitModel.find({ status: 'ACTIVE' });
    const unitTwo: any[] = units.filter((i) => i.displayOrder == '2');
    if (unitTwo && unitTwo.length > 0) {
      const unit2Status = await this.usersUnitStatusModel.findOne({
        unitId: unitTwo[0]._id,
        userId: userId
      });
      if (unit2Status && unit2Status.unlocked) {
        await this.UsersModel.updateOne(
          { _id: userId },
          { $set: { allowMockInterview: true } }
        );
      }
    }

    return { status: 'success', code: '4300' };
  }

  async updateUserDeviceDetails(initiateDto: InitiateDto, userId: string) {
    const devicePayload: any = {};
    if (initiateDto.device) { // this should be remove when all device id get updated.
      devicePayload.device = initiateDto.device;
    }
    if (initiateDto.deviceId) { // this should be remove when all device id get updated.
      devicePayload.deviceId = initiateDto.deviceId;
    }
    if (initiateDto.deviceToken) {
      devicePayload.deviceToken = initiateDto.deviceToken;
    }
    if (initiateDto.deviceInfo) {
      devicePayload.deviceInfo = initiateDto.deviceInfo;
    }
    if (_.isEmpty(devicePayload)) {
      return;
    }
    return await this.UsersModel.updateOne({ _id: userId }, devicePayload);
  }

  async getLeaderBoard(queryParams: any, decodedToken: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 20;
    const skipValue = (parsedPage - 1) * parsedLimit;

    let match: any = { status: 'ACTIVE', megathilPoints: { $gt: 0 } };
    if (queryParams.collegeId) {
      match['college'] = queryParams.collegeId;
    }
    if (queryParams.departmentId) {
      match['department'] = queryParams.departmentId;
    }

    const records = await this.UsersModel.find(match).sort({ megathilPoints: -1, updatedAt: 1 }).limit(500).select({
      id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      profileImage: 1,
      mobileNumber: 1,
      megathilPoints: 1,
    }).populate("college", "id name collegeLogo").populate("department", "id name");

    let leaderboard = records.map((item, i) => {
      return {
        rank: i + 1,
        id: item._id,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        profileImage: item.profileImage,
        mobileNumber: item.mobileNumber,
        megathilPoints: item.megathilPoints,
        college: item.college,
        department: item.department
      };
    });

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber) {
      let orCondition = [];

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
      if (orCondition.length > 0) {
        leaderboard = leaderboard.filter((item) => {
          return orCondition.some(condition => {
            return Object.keys(condition).some(key => item[key]?.match(condition[key]));
          });
        });
      }
    }

    if (decodedToken.role === 'USER') {
      const index = leaderboard.findIndex((user) => user.id == decodedToken.id);
      if (index >= 0) {
        const user = leaderboard[index];
        if (parsedPage == 1) {
          leaderboard.splice(index, 1); // removing user from list if exists again
          leaderboard.unshift(user);
        }
      } else {
        const user = await this.UsersModel.findOne({ _id: decodedToken.id, status: 'ACTIVE' })
          .select({
            id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            profileImage: 1,
            mobileNumber: 1,
            megathilPoints: 1,
          }).populate("college", "id name collegeLogo").populate("department", "id name");

        const userRank: any = {
          rank: "NA",
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          mobileNumber: user.mobileNumber,
          megathilPoints: user.megathilPoints,
          college: user.college,
          department: user.department
        };
        leaderboard.unshift(userRank);
      }
    }

    const finalRecord = leaderboard.splice(skipValue, parsedLimit);
    const count = queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.collegeId || queryParams.departmentId ? finalRecord.length : records.length;
    return { leaderboard: finalRecord, count: count }
  }

  async findUserRank(userId: string, college: string, department: string) {
    const match: any = {
      status: 'ACTIVE',
      megathilPoints: { $gt: 0 }
    }

    if (college) {
      match["college"] = college;
    }

    if (department) {
      match["department"] = department;
    }

    const records = await this.UsersModel.find(match).sort({ megathilPoints: -1, updatedAt: 1 }).limit(500).select({
      id: 1,
      megathilPoints: 1,
    });

    const leaderboard = [];

    for (let i = 0; i < records.length; i++) {
      leaderboard.push({
        rank: i + 1,
        id: String(records[i]._id),
        megathilPoints: records[i].megathilPoints,
      })
    }

    return leaderboard.find((user) => user.id === userId);
  }

  async getUserRanks(userId: string) {
    const userDetails = await this.UsersModel.findOne({ _id: userId });
    const overallRank = await this.findUserRank(userId, "", "");
    const collegeRank = await this.findUserRank(userId, userDetails.college, "");
    const departmentRank = await this.findUserRank(userId, userDetails.college, userDetails.department);
    const userRanks: any = {
      overall: overallRank && overallRank.rank ? overallRank.rank : 'NA',
      college: collegeRank && collegeRank.rank ? collegeRank.rank : 'NA',
      department: departmentRank && departmentRank.rank ? departmentRank.rank : 'NA'
    }
    return userRanks;
  }

  async parseFile(filePath: string, authRole: any, authId: any, collegeId: any, userType: any) {
    const fileExtension = filePath.split('.').pop();
    let data: any[] = [];

    if (fileExtension === 'xlsx') {
      // Handle Excel files
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    } else if (fileExtension === 'csv') {
      // Handle CSV files
      data = await new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    }

    if (!data || data.length === 0) {
      return {
        status: 'error',
        code: '5014'
      }
    }

    if (userType === 'PREMIUM') {
      const college = await this.findCollegeById(collegeId);
      if (college.premiumUserAlloted < data.length) {
        return {
          status: 'error',
          code: '5011'
        }
      }
    }

    let imported: number = 0;
    let rejected: number = 0;
    const usersToInserted: any = [];
    for (const result of data) {
      const { dob } = result;
      const formattedDob = moment(dob, 'DD-MM-YYYY').utc().toDate();
      const newUser = {
        ...result,
        dob: formattedDob,
        college: collegeId ? collegeId : null,
        isExistUser: true,
        role: 'USER',
        status: 'ACTIVE',
        userType: collegeId && userType === 'PREMIUM' ? "PREMIUM" : "BASIC"
      };
      // usersToInsert.push(newUser);
      const existingUser = await this.findUserForExistance({ email: result.email, mobileNumber: result.mobileNumber });
      if (existingUser && existingUser.id) {
        usersToInserted.push({ user: newUser, message: "Email or Mobile number already present." });
        rejected += 1;
      } else {
        try {
          await this.create(newUser, authId, authRole);
          usersToInserted.push({ user: newUser, message: "Saved successfully!" });
          imported += 1;
        } catch (e) {
          usersToInserted.push({ user: newUser, message: e.message });
          rejected += 1;
        }
      }
    }
    return {
      status: 'success',
      code: '5013',
      data: { usersToInserted, imported, rejected }
    }
  }

  async getUserEvaluations(queryParams: any, userId: string) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const ObjectId = mongoose.Types.ObjectId;
    const userObjectId = new ObjectId(userId);;
    const match: any = {
      userId: userObjectId
    }
    const results = await this.userScoresModel.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      {
        $unwind: { path: '$unit', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'modules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module'
        }
      },
      {
        $unwind: { path: '$module', preserveNullAndEmptyArrays: true }
      },
      {
        $sort: { createdAt: -1 }
      },
      { $skip: skipValue },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: "$_id",
          unit: {
            id: "$unit._id",
            unitName: "$unit.unitName"
          },
          modules: {
            id: "$module._id",
            moduleName: "$module.moduleName"
          },
          megathilPoints: "$megathilPoints",
          createdAt: 1
        }
      },
    ]);
    const count = await this.userScoresModel.countDocuments(match).exec();
    return { results, count }
  }

  async assignReferralCodeForUser(userId: string, admin: any) {
    const user = await this.UsersModel.findById(userId);
    if (!user) {
      return { status: "error", code: "5040" };
    }

    if (user && user.referralCode) {
      return { status: "error", code: "5041" };
    }

    const referralCode = generateReferralCode();

    await this.UsersModel.updateOne({ _id: userId }, { referralCode: referralCode });
    this.adminService.logAdminActivities({
      adminId: admin.id,
      action: 'assigned_referral_code',
      activity: `${admin.email} assigned referral code to ${user.email}`,
      userId: userId,
      usefullIdFor: 'userid',
      reason: `${admin.email} assigned referral code to ${user.email}`,
    }).then(() => { }).catch((e) => { console.log("Error", e) });
    return { status: "success", code: "5042", data: { referralCode } };
  }

  async clearDeviceIdForUser(userId: string, admin: any) {
    const user = await this.UsersModel.findById(userId);
    if (!user) {
      return { status: "error", code: "5040" };
    }

    if (user && !user.deviceId) {
      return { status: "error", code: "5046" };
    }

    await this.UsersModel.updateOne({ _id: userId }, { deviceId: "" });

    this.adminService.logAdminActivities({
      adminId: admin.id,
      action: 'cleared_user_device_id',
      activity: `${admin.email} cleared device id of ${user.email}`,
      userId: userId,
      usefullIdFor: 'userid',
      reason: `${admin.email} cleared device id of ${user.email}`,
    }).then(() => { }).catch((e) => { console.log("Error", e) });

    return { status: "success", code: "5044" }
  }

  convertJsonToExcel(jsonData: any): Buffer {
    const xls = json2xls(jsonData);
    return Buffer.from(xls, 'binary');
  }

  async getUserGeneralReports(queryParams: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const match: any = {
      status: 'ACTIVE',
    };

    if (queryParams.collegeId) {
      if (_.isArray(queryParams.collegeId)) {
        match['college'] = { $in: queryParams.collegeId.map((id: string) => new ObjectId(id)) };
      } else {
        match['college'] = new ObjectId(queryParams.collegeId);
      }
    }

    if (queryParams.courseId) {
      if (_.isArray(queryParams.courseId)) {
        match['course'] = { $in: queryParams.courseId.map((id: string) => new ObjectId(id)) };
      } else {
        match['course'] = new ObjectId(queryParams.courseId);
      }
    }

    if (queryParams.departmentId) {
      if (_.isArray(queryParams.departmentId)) {
        match['department'] = { $in: queryParams.departmentId.map((id: string) => new ObjectId(id)) };
      } else {
        match['department'] = new ObjectId(queryParams.departmentId);
      }
    }

    if (queryParams.staffId) {
      if (_.isArray(queryParams.staffId)) {
        match['staff'] = { $in: queryParams.staffId.map((id: string) => new ObjectId(id)) };
      } else {
        match['staff'] = new ObjectId(queryParams.staffId);
      }
    }

    if (queryParams.source) {
      match['source'] = queryParams.source
    }

    if (queryParams.status) {
      match['status'] = queryParams.status
    }

    if (queryParams.userType) {
      match['userType'] = queryParams.userType
    }

    const data = await this.UsersModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "otps",
          localField: "email",
          foreignField: "email",
          pipeline: [
            { $match: { status: "VERIFIED" } },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 }
          ],
          as: "emailOtpDetails"
        }
      },
      {
        $lookup: {
          from: "otps",
          localField: "mobileNumber",
          foreignField: "mobileNumber",
          pipeline: [
            { $match: { status: "VERIFIED" } },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 }
          ],
          as: "mobileOtpDetails"
        }
      },
      {
        $set: {
          hasLoggedIn: {
            $cond: {
              if: { $gt: [{ $size: "$emailOtpDetails" }, 0] },
              then: "Logged In",
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$mobileOtpDetails" }, 0] },
                  then: "Logged In",
                  else: "Not logged in"
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'colleges',
          localField: 'college',
          foreignField: '_id',
          as: 'collegeDetails'
        }
      },
      {
        $unwind: { path: '$collegeDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentDetails'
        }
      },
      {
        $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'userprogressstatuses',
          localField: '_id',
          foreignField: 'userId',
          pipeline: [
            {
              $lookup: {
                from: "units",
                localField: "unitId",
                foreignField: "_id",
                as: "unitDetails"
              }
            },
            { $unwind: "$unitDetails" },
            {
              $addFields: {
                "unitDetails.displayOrderNum": { $toInt: "$unitDetails.displayOrder" },
                "unitDetails.unitName": "$unitDetails.unitName"
              }
            },
            {
              $lookup: {
                from: "modules",
                localField: "moduleId",
                foreignField: "_id",
                as: "moduleDetails"
              }
            },
            { $unwind: "$moduleDetails" },
            {
              $addFields: {
                "moduleDetails.displayOrderNum": { $toInt: "$moduleDetails.displayOrder" },
                "moduleDetails.moduleName": "$moduleDetails.moduleName"
              }
            },
            { $sort: { "unitDetails.displayOrderNum": -1, "moduleDetails.displayOrderNum": -1 } },
            { $limit: 1 }
          ],
          as: 'userProgressStatus'
        }
      },
      {
        $unwind: { path: '$userProgressStatus', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "otps",
          let: { userEmail: "$email", userMobile: "$mobileNumber" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [{ $eq: ["$email", "$$userEmail"] }, { $eq: ["$status", "VERIFIED"] }] },
                    { $and: [{ $eq: ["$mobileNumber", "$$userMobile"] }, { $eq: ["$status", "VERIFIED"] }] }
                  ]
                }
              }
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
          ],
          as: "loginInfo"
        }
      }, 
      { $unwind: { path: '$loginInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          firstName: 1,
          lastName: 1,
          email: 1,
          mobileNumber: 1,
          gender: 1,
          source: 1,
          userType: 1,
          createdAt: 1,
          college: "$collegeDetails.name",
          department: "$departmentDetails.name",
          course: "$courseDetails.name",
          status: "$userProgressStatus.status",
          unitDisplayNum: "$userProgressStatus.unitDetails.displayOrderNum",
          moduleDisplayNum: "$userProgressStatus.moduleDetails.displayOrderNum",
          // hasLoggedIn: {
          //   $cond: { if: { $gt: [{ $size: "$otpDetails" }, 0] }, then: "Logged In", else: "Not logged in" }
          // },
          hasLoggedIn: 1,
          lastLoginTime: "$loginInfo.updatedAt",
          unitName: {
            $ifNull: [
              { $concat: [{ $toString: "$userProgressStatus.unitDetails.unitName" }] },
              "Not started"
            ]
          },
          moduleName: {
            $ifNull: [
              { $concat: [{ $toString: "$userProgressStatus.moduleDetails.moduleName" }] },
              "Not started"
            ]
          }
        }
      },
    ]);

    const transformData = (data: any[]) => {
      return data.map((item, index) => {
        const transformedItem = {
          SNo: `${index + 1}`,
          College: item.college,
          Department: item.department,
          Course: item.course,
          'Mobile Number': item.mobileNumber,
          'Student Name': `${item.firstName} ${item.lastName}`,
          UserType: item.userType,
          CreateDate: moment.utc(item.createdAt).utcOffset(330).format('llll'),
          eMail: item.email,
          Gender: item.gender,
          LoggedIn: item.hasLoggedIn,
          LastLogin: item.lastLoginTime ? moment.utc(item.lastLoginTime).utcOffset(330).format('llll') : 'Not logged in',
          Unit: item && item.unitDisplayNum !== undefined ? `${'Unit'} ${item.unitDisplayNum}` : 'Not Yet started',
          Module: item && item.moduleDisplayNum !== undefined ? `${'M-'}${item.moduleDisplayNum}` : 'Not Yet started'
        };
        return transformedItem;
      });
    };

    const transformedData = transformData(data);
    return transformedData;
  }

  async getUserReports(queryParams: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const match = {
      status: 'ACTIVE',
    }
    if (queryParams.collegeId) {
      if (_.isArray(queryParams.collegeId)) {
        match['college'] = { $in: queryParams.collegeId.map((id: string) => new ObjectId(id)) };
      } else {
        match['college'] = new ObjectId(queryParams.collegeId);
      }
    }

    if (queryParams.courseId) {
      if (_.isArray(queryParams.courseId)) {
        match['course'] = { $in: queryParams.courseId.map((id: string) => new ObjectId(id)) };
      } else {
        match['course'] = new ObjectId(queryParams.courseId);
      }
    }

    if (queryParams.departmentId) {
      if (_.isArray(queryParams.departmentId)) {
        match['department'] = { $in: queryParams.departmentId.map((id: string) => new ObjectId(id)) };
      } else {
        match['department'] = new ObjectId(queryParams.departmentId);
      }
    }

    if (queryParams.staffId) {
      if (_.isArray(queryParams.staffId)) {
        match['staff'] = { $in: queryParams.staffId.map((id: string) => new ObjectId(id)) };
      } else {
        match['staff'] = new ObjectId(queryParams.staffId);
      }
    }

    if (queryParams.source) {
      match['source'] = queryParams.source
    }

    if (queryParams.status) {
      match['status'] = queryParams.status
    }

    if (queryParams.userType) {
      match['userType'] = queryParams.userType
    }

    const data = await this.UsersModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'colleges',
          localField: 'college',
          foreignField: '_id',
          as: 'collegeDetails',
        },
      },
      {
        $unwind: { path: '$collegeDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentDetails'
        }
      },
      {
        $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'questionresponses',
          localField: '_id',
          foreignField: 'userId',
          pipeline: [
            {
              $lookup: {
                from: 'userlearninghistories',
                localField: 'userLearningHistoryId',
                foreignField: '_id',
                as: 'userlearninghistories',
              },
            },
            {
              $lookup: {
                from: 'units',
                localField: 'unitId',
                foreignField: '_id',
                as: 'unitDetails',
              },
            },
            {
              $lookup: {
                from: 'modules',
                localField: 'moduleId',
                foreignField: '_id',
                as: 'moduleDetails',
              },
            },
            {
              $lookup: {
                from: 'questions',
                localField: 'questionId',
                foreignField: '_id',
                pipeline: [
                  {
                    $lookup: {
                      from: 'templatetypes',
                      localField: 'templateType',
                      foreignField: '_id',
                      as: 'templateTypeDetails',
                    },
                  },
                  { $unwind: { path: '$templateTypeDetails', preserveNullAndEmptyArrays: true } },
                  {
                    $lookup: {
                      from: 'options',
                      localField: 'questions.id',
                      foreignField: 'questionId',
                      as: 'options',
                    },
                  },
                  { $unwind: { path: '$options', preserveNullAndEmptyArrays: true } },
                ],
                as: 'questionsDetails',
              },
            },
            {
              $unwind: { path: '$unitDetails', preserveNullAndEmptyArrays: true },
            },
            {
              $unwind: { path: '$moduleDetails', preserveNullAndEmptyArrays: true },
            },
            {
              $unwind: { path: '$questionsDetails', preserveNullAndEmptyArrays: true },
            },
            {
              $addFields: {
                templateTypeDisplayValue: '$questionsDetails.templateTypeDetails.displayValue',
              },
            },
            {
              $match: {
                $or: [
                  { templateTypeDisplayValue: 'aiquestions' },
                  { templateTypeDisplayValue: 'aiAnalysis' },
                ],
              },
            },
            {
              $addFields: {
                fluencyLevelHigh: { $max: { $ifNull: ['$fluencyLevel.score', []] } },
                fluencyLevelLow: { $min: { $ifNull: ['$fluencyLevel.score', []] } },
                energyHigh: { $max: { $ifNull: ['$emotionRecognition.score', []] } },
                energyLow: { $min: { $ifNull: ['$emotionRecognition.score', []] } },
                speechRateHigh: { $max: '$speechRate' },
                speechRateLow: { $min: '$speechRate' },
                vocabularyRatingHigh: { $max: '$vocabularyRating' },
                vocabularyRatingLow: { $min: '$vocabularyRating' },
                contentRelevanceRatingHigh: { $max: '$contentRelevanceRating' },
                contentRelevanceRatingLow: { $min: '$contentRelevanceRating' },
                attempt: {
                  $max: {
                    $cond: {
                      if: { $lt: ['$attempt', '$userlearninghistories.attempt'] },
                      then: '$userlearninghistories.attempt',
                      else: '$attempt',
                    },
                  },
                },
              },
            },
          ],
          as: 'questionResponses',
        },
      },
      {
        $unwind: { path: '$questionResponses', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            userId: '$_id',
            unitId: '$questionResponses.unitDetails.unitId',
            moduleId: '$questionResponses.moduleDetails.moduleId',
            questionId: '$questionResponses.questionsDetails.questionId',
          },
          userRecord: { $first: '$$ROOT' },
          fluencyLevelHigh: { $max: '$questionResponses.fluencyLevelHigh' },
          fluencyLevelLow: { $min: '$questionResponses.fluencyLevelLow' },
          energyHigh: { $max: '$questionResponses.energyHigh' },
          energyLow: { $min: '$questionResponses.energyLow' },
          speechRateHigh: { $max: '$questionResponses.speechRateHigh' },
          speechRateLow: { $min: '$questionResponses.speechRateLow' },
          vocabularyRatingHigh: { $max: '$questionResponses.vocabularyRatingHigh' },
          vocabularyRatingLow: { $min: '$questionResponses.vocabularyRatingLow' },
          contentRelevanceRatingHigh: { $max: '$questionResponses.contentRelevanceRatingHigh' },
          contentRelevanceRatingLow: { $min: '$questionResponses.contentRelevanceRatingLow' },
          attempt: { $max: '$questionResponses.attempt' },
        },
      },
      {
        $project: {
          firstName: '$userRecord.firstName',
          lastName: '$userRecord.lastName',
          email: '$userRecord.email',
          mobileNumber: '$userRecord.mobileNumber',
          gender: '$userRecord.gender',
          source: '$userRecord.source',
          college: '$userRecord.collegeDetails.name',
          department: "$userRecord.departmentDetails.name",
          course: "$userRecord.courseDetails.name",
          unitName: '$userRecord.questionResponses.unitDetails.unitName',
          moduleName: '$userRecord.questionResponses.moduleDetails.moduleName',
          questionTitle: '$userRecord.questionResponses.questionsDetails.questionTitle',
          displayOrder: '$userRecord.questionResponses.unitDetails.displayOrder',
          moduledisplayOrder: '$userRecord.questionResponses.moduleDetails.displayOrder',
          questiondisplayOrder: '$userRecord.questionResponses.questionsDetails.displayOrder',
          fluencyLevelHigh: {
            $cond: {
              if: { $gt: ['$fluencyLevelHigh', 1] },
              then: '$fluencyLevelHigh',
              else: { $round: [{ $multiply: ['$fluencyLevelHigh', 100] }, 0] }
            },
          },
          fluencyLevelLow: {
            $cond: {
              if: { $gt: ['$fluencyLevelLow', 1] },
              then: '$fluencyLevelLow',
              else: { $round: [{ $multiply: ['$fluencyLevelLow', 100] }, 0] }
            },
          },
          energyHigh: {
            $cond: {
              if: { $gt: ['$energyHigh', 1] },
              then: '$energyHigh',
              else: { $round: [{ $multiply: ['$energyHigh', 100] }, 0] }
            },
          },
          energyLow: {
            $cond: {
              if: { $gt: ['$energyLow', 1] },
              then: '$energyLow',
              else: { $round: [{ $multiply: ['$energyLow', 100] }, 0] }
            },
          },
          speechRateHigh: {
            $round: ['$speechRateHigh', 0]
          },
          speechRateLow: {
            $round: ['$speechRateLow', 0]
          },
          vocabularyRatingHigh: 1,
          vocabularyRatingLow: 1,
          contentRelevanceRatingHigh: 1,
          contentRelevanceRatingLow: 1,
          overallScoreHigh: {
            $round: [
              {
                $divide: [
                  {
                    $sum: [
                      { $ifNull: ['$fluencyLevelHigh', 0] },
                      { $ifNull: ['$speechRateHigh', 0] },
                      { $ifNull: [{ $convert: { input: '$vocabularyRatingHigh', to: 'double', onError: 0, onNull: 0 } }, 0] },
                      { $ifNull: [{ $convert: { input: '$contentRelevanceRatingHigh', to: 'double', onError: 0, onNull: 0 } }, 0] },
                      { $ifNull: ['$energyHigh', 0] },
                    ],
                  },
                  5,
                ],
              },
              0,
            ],
          },
          overallScoreLow: {
            $round: [
              {
                $divide: [
                  {
                    $sum: [
                      { $ifNull: ['$fluencyLevelLow', 0] },
                      { $ifNull: ['$speechRateLow', 0] },
                      { $ifNull: [{ $convert: { input: '$vocabularyRatingLow', to: 'double', onError: 0, onNull: 0 } }, 0] },
                      { $ifNull: [{ $convert: { input: '$contentRelevanceRatingLow', to: 'double', onError: 0, onNull: 0 } }, 0] },
                      { $ifNull: ['$energyLow', 0] },
                    ],
                  },
                  5,
                ],
              },
              0,
            ],
          },
          attempt: 1,
        },
      },
      {
        $sort: {
          'displayOrder': 1,
          'moduledisplayOrder': 1,
          'questiondisplayOrder': 1,
        },
      },
    ]);

    const transformData = (data) => {
      return data.map(item => {
        let overallScoreHigh = item.overallScoreHigh || "0";
        let overallScoreLow = item.overallScoreLow || "0";
        let fluencyLevelHigh = item.fluencyLevelHigh || "0";
        let fluencyLevelLow = item.fluencyLevelLow || "0";
        let energyHigh = item.energyHigh || "0";
        let energyLow = item.energyLow || "0";
        let speechRateHigh = item.speechRateHigh || "0";
        let speechRateLow = item.speechRateLow || "0";
        let vocabularyRatingHigh = item.vocabularyRatingHigh || "0";
        let vocabularyRatingLow = item.vocabularyRatingLow || "0";
        let contentRelevanceRatingHigh = item.contentRelevanceRatingHigh || "0";
        let contentRelevanceRatingLow = item.contentRelevanceRatingLow || "0";
        if (item.attempt === 1) {
          overallScoreLow = overallScoreHigh;
          fluencyLevelLow = fluencyLevelHigh;
          energyLow = energyHigh;
          speechRateLow = speechRateHigh;
          vocabularyRatingLow = vocabularyRatingHigh;
          contentRelevanceRatingLow = contentRelevanceRatingHigh;
        }
        return {
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          mobileNumber: item.mobileNumber,
          gender: item.gender,
          source: item.source,
          status: item.unitName && item.moduleName && item.questionTitle ? "Started" : "Yet to start",
          currentStage: item.displayOrder && item.moduledisplayOrder && item.questiondisplayOrder ? `Unit: ${item.displayOrder} Module: ${item.moduledisplayOrder} Question: ${item.questiondisplayOrder}` : "Yet to start",
          college: item.college,
          department: item.department,
          course: item.course,
          unitName: item.unitName || "Yet to start",
          moduleName: item.moduleName || "Yet to start",
          questionTitle: item.questionTitle || "Yet to start",
          attempt: item.attempt || "0",
          overallScoreHigh: overallScoreHigh,
          overallScoreLow: overallScoreLow,
          fluencyLevelHigh: fluencyLevelHigh,
          fluencyLevelLow: fluencyLevelLow,
          energyHigh: energyHigh,
          energyLow: energyLow,
          speechRateHigh: speechRateHigh,
          speechRateLow: speechRateLow,
          vocabularyRatingHigh: vocabularyRatingHigh,
          vocabularyRatingLow: vocabularyRatingLow,
          contentRelevanceRatingHigh: contentRelevanceRatingHigh,
          contentRelevanceRatingLow: contentRelevanceRatingLow,
        };
      });
    };

    const transformedData = transformData(data);
    return transformedData;
  }

  async getUserSummaryReports(userId: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const userUnitStatusResult = await this.usersUnitStatusModel.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$unitId",
          latestEntry: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestEntry" } },
    ]);
    const userscorehistories = await this.userScoreHistoriesModel.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: { unitId: "$unitId", moduleId: "$moduleId" },
          latestEntry: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestEntry" } },
      {
        $project: {
          unitId: 1,
          moduleId: 1,
          moduleMVP: 1,
          scoredMVP: 1,
        },
      },
    ]);
    const userscores = await this.userScoresModel.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: { unitId: "$unitId", moduleId: "$moduleId" },
          latestEntry: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestEntry" } },
      {
        $project: {
          unitId: 1,
          moduleId: 1,
          megathilPoints: 1,
        },
      },
    ]);
    const userprogressstatuses = await this.usersProgressStatusModel.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: { unitId: "$unitId", moduleId: "$moduleId" },
          latestEntry: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestEntry" } },
      {
        $project: {
          unitId: 1,
          moduleId: 1,
          completedPercentage: 1,
        },
      },
    ]);
    try {
      const mergedResults = await this.unitModel.aggregate([
        {
          $match: {
            status: "ACTIVE",
          },
        },
        {
          $lookup: {
            from: "modules",
            let: { unitId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$unitId", "$unitId"] },
                      { $eq: ["$status", "ACTIVE"] },
                    ],
                  },
                },
              },
              { $sort: { updatedAt: -1 } },
            ],
            as: "modules",
          },
        },
        {
          $unwind: {
            path: "$modules",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            unitId: "$_id",
            unitName: "$unitName",
            unitImage: "$imageUrl",
            unlocked: { $ifNull: ["$userUnitStatusResult.unlocked", false] },
            moduleID: "$modules._id",
            moduleName: "$modules.moduleName",
            moduleDisplayOrder: "$modules.displayOrder",
            imageUrl: "$modules.imageUrl",
            lastUpdated: { $ifNull: ["$modules.updatedAt", null] },
            displayOrder: 1,
          },
        },
        {
          $group: {
            _id: { unitId: "$unitId", moduleID: "$moduleID" },
            unitName: { $first: "$unitName" },
            unitImage: { $first: "$unitImage" },
            unlocked: { $first: "$unlocked" },
            modules: {
              $push: {
                moduleID: "$moduleID",
                moduleName: "$moduleName",
                moduleDisplayOrder: "$moduleDisplayOrder",
                imageUrl: "$imageUrl",
                lastUpdated: "$lastUpdated",
              },
            },
            displayOrder: { $first: "$displayOrder" },
          },
        },
        {
          $group: {
            _id: "$_id.unitId",
            unitName: { $first: "$unitName" },
            unitImage: { $first: "$unitImage" },
            unlocked: { $first: "$unlocked" },
            modules: {
              $push: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$modules",
                      as: "module",
                      cond: { $eq: ["$$module.moduleID", "$_id.moduleID"] },
                    },
                  },
                  0,
                ],
              },
            },
            displayOrder: { $first: "$displayOrder" },
          },
        },
        {
          $project: {
            unitId: "$_id",
            unitName: 1,
            unitImage: 1,
            unlocked: 1,
            modules: {
              $reduce: {
                input: "$modules",
                initialValue: [],
                in: {
                  $setUnion: [
                    "$$value",
                    ["$$this"],
                  ],
                },
              },
            },
            displayOrder: 1,
          },
        },
        {
          $sort: {
            displayOrder: 1,
          },
        },
      ]);

      const finalResults = mergedResults.map(unit => {
        const unitStatus = userUnitStatusResult.find(status => status.unitId.equals(unit.unitId));
        const modulesWithScores = unit.modules.map(module => {
          const scoreHistory = userscorehistories.find(history =>
            history.unitId.equals(unit.unitId) &&
            history.moduleId.equals(module.moduleID)
          );

          const score = userscores.find(history =>
            history.unitId.equals(unit.unitId) &&
            history.moduleId.equals(module.moduleID)
          );

          const progressstatuses = userprogressstatuses.find(history =>
            history.unitId.equals(unit.unitId) &&
            history.moduleId.equals(module.moduleID)
          );
          return {
            ...module,
            moduleMVP: scoreHistory ? scoreHistory.moduleMVP : 0,
            scoredMVP: scoreHistory ? scoreHistory.scoredMVP : 0,
            score: score ? score.megathilPoints : 0,
            percentage: progressstatuses ? progressstatuses.completedPercentage : 0
          };
        });
        return {
          ...unit,
          unlocked: unitStatus ? unitStatus.unlocked : false,
          modules: modulesWithScores
        };
      });
      const user = await this.UsersModel.findOne({ _id: userId, status: 'ACTIVE' })
        .select({
          id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          profileImage: 1,
          mobileNumber: 1,
          megathilPoints: 1,
        })
        .populate("college", "id name collegeLogo")
        .populate("department", "id name");
      return { mergedResults: finalResults, user };

    } catch (error) {
      throw new Error("Failed to fetch summary reports.");
    }
  }

  async testTwilio() {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
    const otpOnlyMessage = `This is the test message from Megathil`;

    const resp = await twilioClient.messages.create({
      body: otpOnlyMessage,
      from: twilioPhoneNumber,
      to: `+16027850007`,
    });
    console.log("resp", resp)

  }


  async awardGemsToUsers() {
    try {
      const users = await this.UsersModel.find({
        status: 'ACTIVE',
        xpValue: { $gte: 10000 }
      })
        .select('xpValue _id gemValue deviceToken')
        .exec();
      for (const user of users) {
        const userXP = user.xpValue;
        const awardedMilestones = await this.userGainGemModel.find({ userId: user._id }).select('xp');
        const awardedXPList = awardedMilestones.map(milestone => milestone.xp);
        for (const milestone of xpMilestones) {
          if (userXP >= milestone.xp && !awardedXPList.includes(milestone.xp)) {
            await this.userGainGemModel.create({
              userId: user._id,
              gems: milestone.gems,
              xp: milestone.xp,
            });
            if (user.gemValue !== undefined) {
              user.gemValue += milestone.gems;
              await user.save();
              // Log awardGems userEarning in the database
              this.userEarningsModel.create({
                userId: user._id.toString(),
                activity: "Awared gems",
                action: "xpValue Reached",
                reason: 'Awarded gems for xpValue reached on user.',
                gemValue: milestone.gems,
                xpValue: milestone.xp,
                megathilValue: user.megathilPoints,
                earnedOrSpent: 'AWARDED',
              }).then(() => { })
              // Log awardGems transaction in the database
              this.transactionModel.create({
                item: "GEMS",
                quantity: milestone.gems,
                userId: user._id.toString(),
                refNumber: null,
                payment: null,
                reason: 'Awarded gems for xpValue reached on user.',
                status: 'SUCCESS'
              }).then(() => { });

              // Send notification
              const title = 'Gems Awarded';
              const body = `Congratulations! You've been awarded ${milestone.gems} gems.`;
              try {
                const notificationDto = this.notificationService.createNotificationDto(title, body, user.deviceToken);
                await this.notificationService.sentPushNotification(notificationDto);

                // Log notification in the database
                await this.notificationModel.create({
                  userId: user._id.toString(),
                  title: title,
                  body: body,
                  viewed: 'UNREAD'
                });
              } catch (error) {
                if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
                  console.log(`Skipping invalid device token for user ${user._id}: ${user.deviceToken}`);
                  await this.UsersModel.updateOne(
                    { _id: user._id },
                    { $set: { deviceToken: "" } }
                  );
                } else {
                  console.error(`Error sending notification to user ${user._id}:`, error);
                }
              }
            } else {
              console.error(`gemsPackageId or value is missing for user ${user._id}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in awardGemsToUsers:', error);
    }
  }

  async getUserDayStreaks(userId: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    try {
      const userIdObjectId = new ObjectId(userId);
      const match = {
        userId: userIdObjectId,
        action: 'module_completed',
        createdAt: { $gte: sevenDaysAgo }
      };

      const moduleCompletedDate: any = await this.userActivityModel.find(match).sort({ createdAt: -1 });

      if (moduleCompletedDate.length === 0) {
        const finalDates = [];
        for (let i = 0; i <= 6; i++) {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + i);
          finalDates.push({ createdAt: futureDate, streak: false });
        }
        return finalDates;
      }
      const uniqueDates = new Map();
      moduleCompletedDate.forEach(activity => {
        const date = activity.createdAt.toISOString().split('T')[0];
        if (!uniqueDates.has(date)) {
          uniqueDates.set(date, activity.createdAt);
        }
      });

      const uniqueUpdatedAtDates = Array.from(uniqueDates.values())

      let missingDateIndex = -1;
      for (let i = 0; i < uniqueUpdatedAtDates.length - 1; i++) {
        const currDate = new Date(uniqueUpdatedAtDates[i]);
        const nextDate = new Date(uniqueUpdatedAtDates[i + 1]);
        currDate.setHours(0, 0, 0, 0);
        nextDate.setHours(0, 0, 0, 0);
        const diffTime = currDate.getTime() - nextDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          missingDateIndex = i + 1;
          break;
        }
      }
      const slicedDates = missingDateIndex !== -1 ? uniqueUpdatedAtDates.slice(0, missingDateIndex) : uniqueUpdatedAtDates;
      const finalDates = slicedDates.map(date => ({ createdAt: date, streak: true }));
      const neededCount = 7 - finalDates.length;
      if (neededCount > 0) {
        const lastDateInSliced = new Date(slicedDates[0]);

        for (let i = 1; i <= neededCount; i++) {
          const futureDate = new Date(lastDateInSliced);
          futureDate.setDate(lastDateInSliced.getDate() + i);
          finalDates.push({ createdAt: futureDate, streak: false });
        }
      }


      finalDates.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return finalDates;

    } catch (error) {
      console.log("Error in UserDayStreaks", error);
    }
  }

  async findUserAchievement(queryParams: any) {
    const userId = queryParams?.userId;
    let limit = Number(queryParams.limit) || 20;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const match: any = {};
    if (userId) {
      match.userId = userId;
    }

    try {
      const data = await this.UserAchievementModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .exec();

      const count = await this.UserAchievementModel.countDocuments(match).exec();
      return { data, count };
    } catch (error) {
      console.error(`Error fetching user achievement: ${error}`);
      return {};
    }
  }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkUnitUnlockExpiry() {
    try {
      const oneYearAgo = moment.utc().subtract(365, 'days').toDate();
      console.log(`Cron Job Started: Checking unit unlock expiry`);
      console.log(`Checking for records older than: ${oneYearAgo}`);
      const result = await this.usersUnitStatusModel.updateMany(
        {
          unlocked: true,
          updatedAt: { $lt: oneYearAgo }
        },
        {
          $set: { unlocked: false }
        }
      );
      console.log(`Cron Job Completed: Unit unlock expiry check`);
      console.log(`Total records matched: ${result.matchedCount}`);
      console.log(`Total records modified: ${result.modifiedCount}`);
    } catch (error) {
      console.error(`Error in checkUnitUnlockExpiry cron job: ${error.message}`, error.stack);
    }
  }

  private async htmalDocument(userId: any): Promise<string> {
    const user: any = await this.UsersModel.findOne({ _id: userId, status: 'ACTIVE' })
      .populate("college", "id name collegeLogo")
      .populate("department", "id name")
      .populate("gemsPackageId", "id gems");

    const userRank: any = await this.getUserRanks(userId)
    const filePath: any = `${process.env.IMAGE_URL}/fileUpload/read/`
    const reportSummary: any = await this.getUserSummaryReports(userId)
    const collegeName = user?.college?.name || '--';
    const departmentName = user?.department?.name || '--';


    // Return the HTML as a string
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <style>
       .module-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff; /* Background color for the card */
    margin-bottom: 20px; /* Space between cards */
    padding: 15px; /* Padding inside the card */
}

.module-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px; /* Space between header and content */
}

.module-content {
    padding: 10px 0; /* Padding for the content area */
}

.module-stats {
    color: #888;
    font-weight: bold; /* Make stats labels bold */
}

.progress-bar {
    background-color: #ddd;
    border-radius: 4px;
    height: 6px;
    margin-top: 8px;
}

.progress {
    background-color: #4d5cd2; /* Color for the progress fill */
    height: 100%;
    border-radius: 4px;
}

    </style>
</head>
<body style="font-family: Arial, sans-serif;">
    <!-- Other HTML content remains unchanged -->
    <!-- Main table container -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
    <tr>
        <!-- Profile Image -->
        <td rowspan="2" style="width: 120px; vertical-align: top;">
            <img src="${filePath}${user.profileImage}" alt="Profile Image" style="width: 100px; height: 100px; border-radius: 8px;" />
        </td>
            </tr>
</table>
<table style="width: 100%; border-collapse: separate; border-spacing: 10px; padding: 20px;">
  <tr>
    <!-- Left Column -->
    <td style="width: 50%; vertical-align: top; padding: 10px;">
      <p style="margin: 8px 0; font-size: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: middle;">
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        </svg>
        User Name: ${user.firstName.charAt(0).toUpperCase()}${user.firstName.slice(1).toLowerCase()} 
        ${user.lastName.charAt(0).toUpperCase()}${user.lastName.slice(1).toLowerCase()}
      </p>
      <p style="color: #666; font-size: 16px; margin: 8px 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: middle;">
          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z" />
          <path d="M.05 4.555L8 9.414l7.95-4.86A2 2 0 0 1 16 4v-.058L8 8.414 0 3.414V4z" />
        </svg>
        User Email: ${user.email}
      </p>
      <p style="color: #666; font-size: 16px; margin: 8px 0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: middle;">
          <path fill-rule="evenodd" d="M1.885.511A1.745 1.745 0 0 1 3.612 0h2.235c.778 0 1.49.48 1.745 1.211l.547 1.366c.198.494.138 1.06-.162 1.48L6.34 5.228a1.745 1.745 0 0 0-.396 1.66c.273.798.71 1.61 1.307 2.402.596.793 1.245 1.413 2.062 1.854.464.251 1.032.26 1.508.026l1.572-.758a1.745 1.745 0 0 1 1.623.037l1.148.573c.624.311 1.007.991.917 1.686l-.21 1.64c-.08.627-.491 1.163-1.09 1.326a14.722 14.722 0 0 1-6.01 0 15.593 15.593 0 0 1-5.24-3.11A15.54 15.54 0 0 1 .48 4.703C.316 4.105.61 3.496 1.118 3.152L2.27 2.38a1.745 1.745 0 0 1 1.197-.19l.573.14c.367.09.737-.086.905-.448l.547-1.366z" />
        </svg>
        User Mobile: ${user.mobileNumber}
      </p>
    </td>
    <!-- Right Column -->
    <td style="width: 50%; vertical-align: top; padding: 10px;">
      <p style="margin: 8px 0; font-size: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-graduation-cap" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: middle;">
          <path d="M8 0L0 4l8 4 8-4L8 0zm0 4.55L1.1 4 8 1.5 14.9 4 8 4.55z" />
          <path d="M8 5.5c-.482 0-.843.195-1.17.5.56.12.99.487 1.17.937.18-.45.61-.815 1.17-.937A1.474 1.474 0 0 1 8 5.5zM4.5 7.05A.5.5 0 0 1 5 7.5h.5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.45v-.001zm6 0A.5.5 0 0 1 11 7.5h.5a.5.5 0 0 1 0 1H11a.5.5 0 0 1-.5-.45v-.001zM3.2 8.664A2.5 2.5 0 0 1 4.5 9.5h7a2.5 2.5 0 0 1 1.3-.836L12 6.53l-8 .5-.8-1.529L3.2 8.664zM0 12.5a4.5 4.5 0 0 1 9 0h7a.5.5 0 0 1 0 1h-7a4.5 4.5 0 0 1-9 0h-1z" />
        </svg>
        College Name: ${collegeName.charAt(0).toUpperCase()}${collegeName.slice(1).toLowerCase()}
      </p>
      <p style="margin: 8px 0; font-size: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16" style="margin-right: 8px; vertical-align: middle;">
          <path d="M8 0a.5.5 0 0 1 .5.5v1.586l1.354.854A4.48 4.48 0 0 1 13 3.5a4.48 4.48 0 0 1 1.146 2.41A.5.5 0 0 1 15 6h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5 3.48 3.48 0 0 0-.816-1.005l-.924.924A4.48 4.48 0 0 1 12.5 8a4.48 4.48 0 0 1-2.41 1.146A.5.5 0 0 1 10 10.5h-1a.5.5 0 0 1 0-1h1a3.48 3.48 0 0 0 1.005-.816l-.924-.924A4.48 4.48 0 0 1 8 3.5a4.48 4.48 0 0 1-1.146-2.41A.5.5 0 0 1 6 0h1a.5.5 0 0 1 .5.5v1.586L8 0zM8 12.5a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 0 8 5.5a3.5 3.5 0 0 0-3.5 3.5A3.5 3.5 0 0 0 8 12.5z" />
        </svg>
        Department Name: ${departmentName.charAt(0).toUpperCase()}${departmentName.slice(1).toLowerCase()}
      </p>
    </td>
  </tr>
</table>
<table style="width: 100%; border-collapse: separate; border-spacing: 10px; padding: 20px;">
    <tr>
        <!-- User Stats -->
        <td style="width: 500px; vertical-align: top;">
            <table style="width: 100%; text-align: center;">
                <tr>
                    <!-- First row without bottom borders -->
                    <td style="font-size: 20px; border: 2px dotted #ddd; border-bottom: none; padding: 10px;">${user.gemValue}</td>
                    <td style="font-size: 20px; border: 2px dotted #ddd; border-bottom: none; padding: 10px;">${user.xpValue}</td>
                    <td style="font-size: 20px; border: 2px dotted #ddd; border-bottom: none; padding: 10px;">${user.megathilPoints}</td>
                </tr>
                <tr>
                    <!-- Second row without top borders -->
                    <td style="color: #888; border: 2px dotted #ddd; border-top: none; padding: 8px;">Gems</td>
                    <td style="color: #888; border: 2px dotted #ddd; border-top: none; padding: 8px;">⭐XP</td>
                    <td style="color: #888; border: 2px dotted #ddd; border-top: none; padding: 8px;">🏆MVP</td>
                </tr>
            </table>
        </td>
    </tr>

    <!-- Achievement Section -->
    <tr>
        <td colspan="2" style="padding-top: 20px;">
            <table style="width: 100%; text-align: center;">
                <tr>
                    <!-- First row without bottom borders -->
                    <td style="font-size: 24px; border: 2px dotted #ddd; border-bottom: none; padding: 10px;">${userRank.overall}</td>
                    <td style="font-size: 24px; border: 2px dotted #ddd; border-bottom: none; padding: 10px;">${userRank.college}</td>
                    <td style="font-size: 24px; border: 2px dotted #ddd; border-bottom: none; padding: 10px;">${userRank.department}</td>
                </tr>
                <tr>
                    <!-- Second row without top borders -->
                    <td style="color: #888; border: 2px dotted #ddd; border-top: none; padding: 8px;">Overall</td>
                    <td style="color: #888; border: 2px dotted #ddd; border-top: none; padding: 8px;">College</td>
                    <td style="color: #888; border: 2px dotted #ddd; border-top: none; padding: 8px;">Department</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

    <!-- Horizontal Rule -->
    <hr style="border: 1px solid #C975DC; width: 100%; margin: 10; padding: 0; display: block">

    <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
    ${reportSummary && reportSummary.mergedResults.map((item: any) => {
      return `
            <tr>
                <td style="width: 60px; vertical-align: top;">
                    <img src="${item.unitImage}" alt="Unit Icon" style="width: 50px; height: 50px; border-radius: 50%;">
                </td>
                <td style="vertical-align: top;">
                    <h2 style="margin: 0; font-size: 16px; color: #5D5CCA;">${item.unitName}</h2>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="padding: 10px 20px;">
                    <div class="module-grid" style="display: flex; flex-wrap: wrap; gap: 20px;">
                        ${item && item.modules.map((module: any) => {
        const accuracy = (module.moduleMVP + module.scoredMVP) / 2;
        return `
                            <div class="module-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 10px; width: calc(75% - 20px); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                <div class="module-header" style="margin-bottom: 10px;">
                                    <strong class="module-title" style="font-size: 14px;">${module.moduleName}</strong>
                                </div>
                                <div class="module-content">
                                    <table style="width: 100%;">
                                        <tr>
                                            <td class="module-stats" style="font-size: 12px;">Accuracy</td>
                                            <td class="module-stats" style="font-size: 12px;">Completed</td>
                                            <td class="module-stats" style="font-size: 12px; text-align: right;">Score</td>
                                        </tr>
                                        <tr>
                                            <td style="font-size: 12px;">${accuracy}%</td>
                                            <td style="font-size: 12px;">
                                                ${module.percentage}%
                                                <div class="progress-bar" style="background-color: #f0f0f0; border-radius: 5px; overflow: hidden; width: 100%; height: 10px;">
                                                    <div class="progress" style="background-color: #5D5CCA; width: ${module.percentage}%; height: 100%;"></div>
                                                </div>
                                            </td>
                                            <td style="font-size: 12px; text-align: right;">${module.score}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        `;
      }).join('')}
                    </div>
                </td>
            </tr>
            `;
    }).join('')}
</table>
</body>
</html>

    `
  }

  async generatePdf(userId: string): Promise<Buffer> {
    try {
      const htmlContent = await this.htmalDocument(userId);

      return new Promise((resolve, reject) => {
        pdf.create(htmlContent, {
          format: 'A4',
          orientation: 'portrait',
          border: '10mm',
          zoomFactor: '1',
          width: 950, // Adjust to your desired width in pixels
          height: 1000 // Adjust to your desired height in pixels
          // pageWidth: 210, // Adjust to your desired width in millimeters
          // pageHeight: 297

        }).toBuffer((err, buffer) => {
          if (err) {
            console.error('Error generating PDF:', err);
            return reject(new Error('PDF generation failed'));
          }
          resolve(buffer);
        });

      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('PDF generation failed');
    }
  }

}
