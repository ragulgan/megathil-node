import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PromoCode } from './promotor.schema';
import { CreatePromotorDto } from './dto/createPromotor.dto';
import { UpdatePromotorDto } from './dto/updatePromotor.dto';
import * as _ from 'lodash';
import { generatePromotorPassCode } from 'src/utill/utill';
import { EmailService } from '../emailService/emailService.service'
import { PromotorLoginDto } from 'src/auth/dto/logindto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.schema';
import { SystemVariables } from '../systemVariables/systemVariables.schema';
import { PromotorActivity } from './promotor.Activities.schema';
import { UserActivity } from '../users/usersActivites.schema';
const mongoose = require('mongoose');
const saltOrRounds = 10;

@Injectable()
export class PromoCodeService {
    constructor(
        @InjectModel(PromoCode.name) private PromoCodeModel: Model<PromoCode>,
        @InjectModel(User.name) private UsersModel: Model<User>,
        @InjectModel(SystemVariables.name) private systemVariablesModel: Model<SystemVariables>,
        @InjectModel(PromotorActivity.name) private PromotorActivityModel: Model<PromotorActivity>,
        @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>,
        private readonly emailService: EmailService,
    ) { }

    async findPromotorForExistance(createPromoDto: CreatePromotorDto): Promise<PromoCode | null> {
        try {
            let orConditions: any[] = [
                { email: new RegExp(`^${createPromoDto.email}$`, 'i') },
                { mobileNumber: new RegExp(`^${createPromoDto.mobileNumber}$`, 'i') },
                { promotedCode: new RegExp(`^${createPromoDto.promotedCode}$`, 'i') },
            ];

            const match = { $or: orConditions, status: { $ne: 'DELETED' } };
            return await this.PromoCodeModel.findOne(match).exec();
        } catch (err) {
            throw new Error('Error finding PromoCode');
        }
    }

    async findPromotorForExistanceButId(id: string, UpdatedPromoDto: UpdatePromotorDto): Promise<PromoCode | null> {
        try {
            let orConditions: any[] = [
                { email: UpdatedPromoDto.email },
                { mobileNumber: UpdatedPromoDto.mobileNumber },
                { promotedCode: UpdatedPromoDto.promotedCode }
            ]
            const match = { _id: { $ne: id }, $or: orConditions, status: { $ne: 'DELETED' } }
            return await this.PromoCodeModel.findOne(match).exec();
        } catch (err) {
            throw new Error('Error finding PromoCode');
        }
    }

    async create(createPromotorDto: CreatePromotorDto): Promise<PromoCode> {
        try {
            const passwordGenerate = generatePromotorPassCode();
            const password = await bcrypt.hash(passwordGenerate, saltOrRounds);
            const role = 'PROMOTOR';
            const customizeData = {
                ...createPromotorDto,
                password,
                role
            }
            const createdPromotor = new this.PromoCodeModel(customizeData);
            const data = await createdPromotor.save();
            const systemVariables = await this.systemVariablesModel.find({ status: 'ACTIVE' });
            const appStore = systemVariables.find((item) => item.name === "App_store");
            const playStore = systemVariables.find((item) => item.name === "play_store");
            const promotorLoginLink = systemVariables.find((item) => item.name === "PROMOTER_url");
            const sendEmail = process.env.SEND_EMAIL;
            if (sendEmail && sendEmail === 'true') {
                try {
                    const templateData = {
                        "name": `${createPromotorDto.firstName} ${createPromotorDto.lastName}`,
                        "googleURL":`${playStore.value}${createPromotorDto.promotedCode}`,
                        "appStoreURL":`${appStore.value}${createPromotorDto.promotedCode}`,
                        "promoCode": `${createPromotorDto.promotedCode}`,
                        "loginLink": `${promotorLoginLink.value}`,
                        "email": `${createPromotorDto.email}`,
                        "password": `${passwordGenerate}`
                    }
                    await this.emailService.sendMail(
                        createPromotorDto.email,
                        "Welcome to Our Service",
                        "PROMOTOR",
                        templateData
                    ).then(() => { })
                } catch { }
            }
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Country.");
        }
    }

    async logPromotorActivities(params: any) {
        const activity = new this.PromotorActivityModel(params);
        return activity.save();
      }

    // async findAll(queryParams: any) {
    //     const limit = Number(queryParams.limit)
    //     const page = Number(queryParams.page)
    //     const skipValue = Number(page - 1) * limit
    //     let match: any = { status: 'ACTIVE' }


    //     if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.promotedCode) {
    //         const orCondition = []
    //         if (queryParams.firstName) {
    //             const splitValue = queryParams.firstName.split(' ');
    //             const filteredArr = splitValue.filter(entry => /\S/.test(entry));
    //             const firstName = filteredArr[0];
    //             if (firstName) {
    //                 orCondition.push({
    //                     firstName: new RegExp(`${firstName}`, 'i')
    //                 });
    //             }
    //         }

    //         if (queryParams.lastName) {
    //             const splitValue = queryParams.lastName.split(' ');
    //             const filteredArr = splitValue.filter(entry => /\S/.test(entry));
    //             const lastName = filteredArr[filteredArr.length - 1];
    //             if (lastName) {
    //                 orCondition.push({
    //                     lastName: new RegExp(`${lastName}`, 'i')
    //                 });
    //             }
    //         }
    //         if (queryParams.email) {
    //             orCondition.push({
    //                 email: new RegExp(`${queryParams.email}`, 'i')
    //             });
    //         }
    //         if (queryParams.mobileNumber) {
    //             orCondition.push({
    //                 mobileNumber: new RegExp(`${queryParams.mobileNumber}`, 'i')
    //             });
    //         }
    //         if (queryParams.promotedCode) {
    //             orCondition.push({
    //                 promotedCode: new RegExp(`${queryParams.promotedCode}`, 'i')
    //             });
    //         }
    //         match = { ...match, $or: orCondition }
    //     }

    //     if (queryParams.status) {
    //         match.status = queryParams.status;
    //     }

    //     const PromotorList = await this.PromoCodeModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    //     const count = await this.PromoCodeModel.countDocuments(match).exec()
    //     return { PromotorList, count };
    // }

    async findAll(queryParams: any) {
        const limit = queryParams.limit ? Number(queryParams.limit) : 10;
        const page = queryParams.page ? Number(queryParams.page) : 1;
        const skipValue = (page - 1) * limit;
        let match: any = { status: 'ACTIVE' };
        if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.promotedCode) {
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
            if (queryParams.promotedCode) {
                orCondition.push({
                    promotedCode: new RegExp(`${queryParams.promotedCode}`, 'i')
                });
            }
            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const PromotorList = await this.PromoCodeModel.aggregate([
            {
                $match: match,
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skipValue,
            },
            {
                $limit: limit,
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'promotedCode',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['ACTIVE', '$status']
                                }
                            }
                        }
                    ],
                    foreignField: 'promotedBy',
                    as: 'users',
                },
            },
            {
                $addFields: {
                    userCount: { $size: '$users' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    mobileNumber: 1,
                    promotedCode: 1,
                    profileImage: 1,
                    role: 1,
                    password: 1,
                    status: 1,
                    createdAt: 1,
                    userCount: 1
                },
            },
        ]);

        const count = await this.PromoCodeModel.countDocuments(match).exec();
        return { PromotorList, count };
    }

    async findAllUser(queryParams: any, id: string, role: string) {
        const ObjectId = mongoose.Types.ObjectId;
        const promotedId = new ObjectId(id)
        const findPromotor = await this.PromoCodeModel.findById(promotedId).exec();
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = Number(page - 1) * limit
        let match: any = {
            $and: [
              { promotedBy: findPromotor.promotedCode.toString() },
              { status: 'ACTIVE' }
            ]
          };


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

        if (queryParams.userId) {
            match['_id'] = new ObjectId(queryParams.userId)
          }

        if (!_.isEmpty(queryParams.userId)) {
          if (role === 'PROMOTOR') {
            try {
              this.logPromotorActivities({
                promotorId: id,
                action: 'viewed_user_profile',
                activity: 'Viewed User Profile',
                userId: queryParams.userId,
                reason: `Viewed user profile details`
              }).then(() => { });
            } catch { }
          }
        }

        const PromotorUserList = await this.UsersModel.aggregate([
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
            { $sort: { createdAt: -1 }},
            { $skip: skipValue },
            { $limit: limit }
          ]).exec();
        const count = await this.UsersModel.countDocuments(match).exec()
        return { PromotorUserList, count };
    }

    async findMyUserActivityById(userId: string, promotorId: string, role: string, queryParams: { limit?: number; page?: number }) {
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
          if (role === 'PROMOTOR') {
            try {
              this.logPromotorActivities({
                promotorId: promotorId,
                action: 'viewed_user_activity',
                activity: 'Viewed User Activity',
                userId: userId,
                reason: `Viewed user activity details`
              }).then(() => { });
            } catch { }
          }
          return { userActivities, count };
        } catch (error) {
          throw new Error(`Failed to find user activities: ${error.message}`);
        }
      }

      async getPromotorActivities(promotorId: any, queryParams: any) {
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = (page - 1) * limit;
    
        const match: any = {};
        if (queryParams.action) {
          match.action = queryParams.action;
        }
        if (promotorId) {
          match.promotorId = promotorId;
        }
    
        const PromotorActivityList = await this.PromotorActivityModel.find(match)
          .sort({ createdAt: -1 })
          .skip(skipValue)
          .limit(limit)
          .populate({
            path: 'promotorId',
            select: 'firstName lastName email mobileNumber profileImage role'
          })
          .populate('userId', 'firstName lastName email mobileNumber')
          .exec();
        const count = await this.PromotorActivityModel.countDocuments(match).exec();
        return { PromotorActivityList, count };
      }

    async findById(id: string): Promise<PromoCode> {
        return this.PromoCodeModel.findById(id).exec();
    }

    async update(id: string, updatedPromotorDto: UpdatePromotorDto): Promise<PromoCode> {
        return this.PromoCodeModel.findOneAndUpdate({ _id: id }, updatedPromotorDto).exec();
    }

    async authenticatePromotor(promotorLoginDto: PromotorLoginDto): Promise<any> {
        return this.PromoCodeModel.findOne({ email: promotorLoginDto.email }).exec();
      }

    async delete(id: string): Promise<PromoCode> {
        const random = Math.floor(Math.random() * 100000000);
        const promotor = await this.PromoCodeModel.findById(id);
        const deletedUser = await this.PromoCodeModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED', mobileNumber: `deleted_${random}_${promotor.mobileNumber}`, email: `deleted_${random}_${promotor.email}`, promotedCode: `deleted_${random}_${promotor.promotedCode}` } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedUser
    }

}
