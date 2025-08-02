import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interviewer } from './interviewer.schema';
import { CreateInterviewerDto } from './dto/createInterviewer.dto';
import { UpdatedInterviewerDto } from './dto/updateInterviewer.dto';
import * as _ from 'lodash';
import { InterviewerLoginDto } from '../auth/dto/logindto';
import { InterviewerActivity } from './interviewerActivites.schema';
import { AdminService } from '../adminUsers/admin.service';
const mongoose = require('mongoose');
import { EmailService } from '../emailService/emailService.service'
import * as bcrypt from 'bcrypt';
const saltOrRounds = 10;
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class InterviewerService {
  constructor(
    @InjectModel(Interviewer.name) private InterviewerModel: Model<Interviewer>,
    @InjectModel(InterviewerActivity.name) private InterviewerActivityModel: Model<InterviewerActivity>,
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,

  ) { }

  async create(createInterviewerDto: CreateInterviewerDto, decodedToken: any) {
    try {
      // createInterviewerDto = await bcrypt.hash(createInterviewerDto.password, saltOrRounds);

      const hashedPassword = await bcrypt.hash(createInterviewerDto.password, saltOrRounds);
      const newInterviewer = {
        ...createInterviewerDto,
        password: hashedPassword,
      };

      const createdInterviewer = new this.InterviewerModel(newInterviewer);
      if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
        try {
          await this.adminService.logAdminActivities({
            adminId: decodedToken.id,
            action: 'interviewer_created',
            activity: 'Interviewer Created',
            interviewerId: createdInterviewer.id,
            usefullIdFor: 'interviewerId',
            reason: `${createInterviewerDto.firstName} Interviewer Created.`
          });
        } catch (error) {
          console.error('Error logging admin activities:', error);
        }
      }
      const sendEmail = process.env.SEND_EMAIL;
        if (sendEmail && sendEmail === 'true') {
      try {
        const templateData = {
          "name": `${createInterviewerDto.firstName} ${createInterviewerDto.lastName}`,
          "message": "Welcome on board! We’re thrilled to have you join the Megathil team as an interviewer. Your expertise will play a key role in helping learners prepare for real-world interviews."
        }
        // will be uncommented once email template is ready
        await this.emailService.sendMail(
          createInterviewerDto.email,
          "Welcome to Our Service",
          "INTERVIEWER",
          templateData
        ).then(()=>{})
      } catch { }
     }
      return await createdInterviewer.save();
    } catch (error) {
      console.log('error', error)
      throw new Error("Validation Error occurred while saving Interviewer.");
    }
  }

  async findAllForDropdown(queryParams: any) {
    let match: any = { status: 'ACTIVE' }
    if (queryParams.firstName || queryParams.lastName) {
      const orCondition = []
      if (queryParams.firstName) {
        orCondition.push({
          firstName: new RegExp(`${queryParams.firstName}`, 'i')
        });
      }

      if (queryParams.lastName) {
        orCondition.push({
          lastName: new RegExp(`${queryParams.lastName}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }
    return await this.InterviewerModel.find(match).select({ _id: 1, firstName: 1, lastName: 1 }).sort({ createdAt: -1 }).exec();
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit) || 10
    const page = Number(queryParams.page) || 1
    const skipValue = (page - 1) * limit;
    let match: any = { status: 'ACTIVE' }

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.qualification) {
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

      if (queryParams.qualification) {
        orCondition.push({
          qualification: new RegExp(`${queryParams.qualification}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.gender) {
      match.gender = queryParams.gender;
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    const InterviewerList = await this.InterviewerModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.InterviewerModel.countDocuments(match).exec()
    return { InterviewerList, count };
  }

  async listInterviewersForUsers(queryParams: any) {
    const limit = Number(queryParams.limit) || 10
    const page = Number(queryParams.page) || 1
    const skipValue = (page - 1) * limit;
    let match: any = { status: 'ACTIVE' }

    if (queryParams.firstName || queryParams.lastName || queryParams.email || queryParams.mobileNumber || queryParams.qualification) {
      const orCondition = []
      if (queryParams.firstName) {
        orCondition.push({
          firstName: new RegExp(`${queryParams.firstName}`, 'i')
        });
      }

      if (queryParams.lastName) {
        orCondition.push({
          lastName: new RegExp(`${queryParams.lastName}`, 'i')
        });
      }

      if (queryParams.qualification) {
        orCondition.push({
          qualification: new RegExp(`${queryParams.qualification}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.gender) {
      match.gender = queryParams.gender;
    }

    const InterviewerList = await this.InterviewerModel.find(match)
      .select({
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        mobileNumber: 1,
        qualification: 1,
        experience: 1,
        organization: 1,
        organizationLogo: 1,
        gender: 1,
        profileImage: 1,
        aboutMe: 1
      })
      .sort({ createdAt: -1 })
      .skip(skipValue)
      .limit(limit)
      .exec();
    const count = await this.InterviewerModel.countDocuments(match).exec()
    return { InterviewerList, count };

  }

  async findByEmail(email: string): Promise<Interviewer | null> {
    const Interviewer = await this.InterviewerModel.findOne({ email }).exec();
    return Interviewer || null;
  }


  async findById(id: string): Promise<Interviewer> {
    return this.InterviewerModel.findById(id).exec();
  }

  async findInterviewerForUser(id: string): Promise<Interviewer> {
    return this.InterviewerModel.findById(id).select({
      id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      mobileNumber: 1,
      qualification: 1,
      experience: 1,
      organization: 1,
      organizationLogo: 1,
      gender: 1,
      profileImage: 1,
      aboutMe: 1
    }).exec();
  }

  async profileUpdate(id: string, updatedInterviewerDto: UpdatedInterviewerDto, decodedToken: any): Promise<Interviewer> {
    if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
      try {
        await this.adminService.logAdminActivities({
          adminId: decodedToken.id,
          action: 'interviewer_profile_updated',
          activity: 'Interviewer Profile Updated',
          interviewerId: id,
          usefullIdFor: 'interviewerId',
          reason: `${updatedInterviewerDto.firstName} Interviewer Profile Updated.`
        });
      } catch (error) {
        console.error('Error logging admin activities:', error);
      }
    }
    return this.InterviewerModel.findOneAndUpdate({ _id: id }, updatedInterviewerDto).exec();
  }


  async update(id: string, updatedInterviewerDto: UpdatedInterviewerDto, decodedToken: any): Promise<Interviewer> {
    if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
      try {
        await this.adminService.logAdminActivities({
          adminId: decodedToken.id,
          action: 'interviewer_updated',
          activity: 'Interviewer Updated',
          interviewerId: id,
          usefullIdFor: 'interviewerId',
          reason: `${updatedInterviewerDto.firstName} Interviewer Updated.`
        });
      } catch (error) {
        console.error('Error logging admin activities:', error);
      }
    }
    return this.InterviewerModel.findOneAndUpdate({ _id: id }, updatedInterviewerDto).exec();
  }

  async AdminUpdate(newInterviewer: any) {
    return this.InterviewerModel.findOneAndUpdate(
      { _id: newInterviewer.interviewerId },
      { password: newInterviewer.password },
      { new: true }
    ).exec();
  }

  async delete(id: string, decodedToken: any): Promise<Interviewer> {
    const deletedInterviewer = await this.InterviewerModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      ).lean()
      .exec();
    if (decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN') {
      try {
        await this.adminService.logAdminActivities({
          adminId: decodedToken.id,
          action: 'interviewer_deleted',
          activity: 'Interviewer Deleted',
          interviewerId: id,
          usefullIdFor: 'interviewerId',
          reason: `Interviewer with ID ${id} Profile Deleted.`
        });
      } catch (error) {
        console.error('Error logging admin activities:', error);
      }
    }
    return deletedInterviewer
  }

  async authenticateInterviewer(InterviewerLoginDto: InterviewerLoginDto): Promise<Interviewer> {
    return this.InterviewerModel.findOne({ email: InterviewerLoginDto.email }).exec();
  }

  async InterviewerChangepassword(InterviewerChangepasswordDto: any, InterviewerId: any) {
    const { currentPassword, newPassword } = InterviewerChangepasswordDto;
    const Interviewer = await this.InterviewerModel.findById(InterviewerId);
    if (!Interviewer) {
      throw new Error('user not found');
    }
    const isMatch = await bcrypt.compare(currentPassword, Interviewer.password);
    if (!isMatch) {
      throw new Error('incorrect');
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    Interviewer.password = hashedPassword;
    const data = await Interviewer.save();
    return data
  }



  async interviewerForgotPassword(interviewerfForgotPasswordDto: any) {
    const { email, mobileNumber } = interviewerfForgotPasswordDto;
    const interviewerf = await this.InterviewerModel.findOne({
      $or: [
        { email: email },
        { mobileNumber: mobileNumber }
      ]
    }).exec();
    if (!_.isEmpty(interviewerf)) {
      // const otp = Math.floor(100000 + Math.random() * 900000).toString();
      interviewerf.otp = "1234";
      await interviewerf.save();
      return interviewerf;
    } else {
      return false
    }
  }

  async interviewerResetPassword(interviewerfResetpasswordDto: any) {
    const { email, mobileNumber, newPassword, otp } = interviewerfResetpasswordDto;
    const isOtpValid = await this.verifyOtp(email, mobileNumber, otp);
    if (!isOtpValid) {
      return false;
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    const interviewerf = await this.InterviewerModel.findOneAndUpdate(
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
    const data = await interviewerf.save();
    if (!_.isEmpty(data)) {
      const params = {
        interviewerId: data._id.toString(),
        activity: "Forgot Password Changed",
        action: "forgot_password_changed",
        shortDescription: "Forgot password was changed",
      }
      await this.logInterViewerActivity(params)
    }
    return data;
  }

  async verifyOtp(email: string, mobileNumber: string, otp: string): Promise<boolean> {
    const interviewerf = await this.InterviewerModel.findOne({
      $or: [
        { email: email },
        { mobileNumber: mobileNumber }
      ]
    });
    if (!interviewerf) {
      return false;
    }
    if (interviewerf.otp !== otp) {
      return false;
    }
    return true
  }

  async logInterViewerActivity(params: Partial<InterviewerActivity>) {
    const activity = new this.InterviewerActivityModel(params);
    return activity.save();
  }

  async handleInterviewRequestAction(decodedToken: any, actionType: string) {
    try {
      let activity: any;
      let shortDescription: any;
      switch (actionType) {
        case 'accepted':
          activity = "Interviewer Accepted";
          shortDescription = 'Interviewer accepted the booking';
          break;

        case 'rejected':
          activity = "Interviewer Rejected";
          shortDescription = 'Interviewer rejected the booking';
          break;

        case 'cancelled':
          activity = "Booking Cancelled";
          shortDescription = 'The booking was cancelled';
          break;

        case 'leave':
          activity = "Interviewer on Leave";
          shortDescription = 'Interviewer is currently on leave';
          break;

        case 'availability':
          activity = "Availability Created";
          shortDescription = 'Interviewer created availability';
          break;

        case 'completed':
          activity = "Interview completed";
          shortDescription = 'Interviewer completed an interview and updated the results.';
          break;

        default:
          throw new Error('Invalid action type');
      }

      const params = {
        interviewerId: decodedToken.id,
        activity: activity,
        action: `interviewer_${actionType}`,
        shortDescription: shortDescription,
      };
      const Interviewactivity = new this.InterviewerActivityModel(params);
      return Interviewactivity.save();

    } catch (error) {
      throw new Error(`Failed to ${actionType} interview request`);
    }
  }


  async findAllInterviewersActivities(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;

    const match: any = {};

    if (queryParams?.interviewerId) {
      match["interviewerId"] = new ObjectId(queryParams?.interviewerId);
    }

    let interviewerMatch: any = {};

    if (queryParams.firstName || queryParams.lastName) {
      const orCondition = [];

      if (queryParams.firstName) {
        const splitValue = queryParams.firstName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const firstName = filteredArr[0];
        if (firstName) {
          orCondition.push({
            'interviewer.firstName': new RegExp(`${firstName}`, 'i')
          });
        }
      }

      if (queryParams.lastName) {
        const splitValue = queryParams.lastName.split(' ');
        const filteredArr = splitValue.filter(entry => /\S/.test(entry));
        const lastName = filteredArr[filteredArr.length - 1];
        if (lastName) {
          orCondition.push({
            'interviewer.lastName': new RegExp(`${lastName}`, 'i')
          });
        }
      }
      interviewerMatch = { $or: orCondition };
    }

    const interviewerActivities = await this.InterviewerActivityModel.aggregate([
      {
        $match: match
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
        $unwind: { path: '$interviewer', preserveNullAndEmptyArrays: true },
      },
      { $match: { interviewerId: { $ne: {} }, ...interviewerMatch } },
      {
        $project: {
          _id: 1,
          activity: 1,
          shortDescription: 1,
          action: 1,
          createdAt: 1,
          updatedAt: 1,
          interviewerId: {
            id: '$interviewer._id',
            firstName: '$interviewer.firstName',
            lastName: '$interviewer.lastName',
            email: '$interviewer.email',
            mobileNumber: '$interviewer.mobileNumber',
            gender: '$interviewer.mobileNumber',
            organization: '$interviewer.organization',
            profileImage: '$interviewer.profileImage'
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
          from: 'interviewers',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer'
        }
      },
      {
        $unwind: { path: '$interviewer', preserveNullAndEmptyArrays: true },
      },
      { $match: { interviewerId: { $ne: {} }, ...interviewerMatch } },
      { $count: 'total' }
    ];

    const countResult = await this.InterviewerActivityModel.aggregate(countPipeline).exec();
    const count = countResult.length > 0 ? countResult[0].total : 0;
    return { interviewerActivities, count };
  }

  async findInterviewersActivityById(interviewerId: string, queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;

    const match: any = { interviewerId: new ObjectId(interviewerId) };
    if (queryParams.interviewerId) {
      match["interviewerId"] = queryParams.interviewerId;
    }

    try {
      const Id = new ObjectId(interviewerId);
      const InterviewerActivities = await this.InterviewerActivityModel.aggregate([
        {
          $match: { interviewerId: Id }
        },
        {
          $lookup: {
            from: 'interviewers',
            let: { interviewerId: '$interviewerId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$interviewerId'] },
                      { $eq: ['$status', 'ACTIVE'] }
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: 'users',
                  let: { interviewerId: '$_id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ['$interviewerId', '$$interviewerId'] },
                            { $eq: ['$status', 'ACTIVE'] }
                          ]
                        }
                      }
                    }
                  ],
                  as: 'users'
                }
              }
            ],
            as: 'interviewer'
          }
        },
        {
          $addFields: {
            originalId: '$_id',
            activity: '$activity',
            action: '$action',
            shortDescription: '$shortDescription',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            interviewer: { $arrayElemAt: ['$interviewer', 0] }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ originalId: '$originalId', activity: '$activity', action: '$action', shortDescription: '$shortDescription', createdAt: '$createdAt', updatedAt: '$updatedAt' }, '$interviewer']
            }
          }
        },
        {
          $sort: { updatedAt: -1 }
        },
        { $skip: skipValue },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            id: "$originalId",
            activity: "$activity",
            action: "$action",
            shortDescription: "$shortDescription",
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            interviewerId: {
              id: '$_id',
              firstName: '$firstName',
              lastName: '$lastName',
              email: '$email',
              mobileNumber: '$mobileNumber',
              profileImage: '$profileImage'
            },
            // interviewerId: "$_id",
            // firstName: 1,
            // email: 1,
            // mobileNumber: 1,
            // dob: 1,
            // gender: 1,
            // lastName: 1,
            // currentAddress: 1,
            // jobRole: 1,
            // qualification: 1,
            // organization: 1,
            // profileImage: 1,
            // aboutMe: 1,
            // role: 1,
            // users: {
            //   $map: {
            //     input: '$users',
            //     as: 'user',
            //     in: {
            //       id: "$$user._id",
            //       firstName: "$$user.firstName",
            //       email: "$$user.email",
            //       mobileNumber: "$$user.mobileNumber",
            //       dob: "$$user.dob",
            //       gender: "$$user.gender",
            //       lastName: "$$user.lastName",
            //       currentAddress: "$$user.currentAddress",
            //       profileImage: "$$user.profileImage"
            //     }
            //   }
            // }
          }
        }
      ]).exec();
      const count = await this.InterviewerActivityModel.countDocuments(match).exec();
      return { InterviewerActivities, count };
    } catch (error) {
      throw new Error(`Failed to find Interviewer activities: ${error.message}`);
    }
  }
}
