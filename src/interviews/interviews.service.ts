import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { InterviewerActivity } from 'src/interviewer/interviewerActivites.schema';
import { InterviewerAvailabilities } from './interviewerAvailability.schema';
import { InterviewerAvailabilityDto } from './dto/interviewerAvailability.dto';
import { ServiceDaysDto } from './dto/serviceDays.dto';
import * as moment from 'moment';
import { ApplyDto } from './dto/apply.dto';
import { CancelDto } from './dto/cancel.dto';
import { AcceptDto } from './dto/accept.dto';
import { HolidayDto } from './dto/holiday.dto';
import { UserBookings } from './userBookings.schema';
import { Interviewer } from 'src/interviewer/interviewer.schema';
import { CompleteDto } from './dto/complete.dto';
import { Gems } from 'src/gems/gems.schema';
import { User } from 'src/users/users.schema';
import { Transaction } from 'src/transaction/transactions.schema';
import { UserEarnings } from 'src/users/userEarnings.schema';

import { ReviewDto } from './dto/review.dto';
import { InterviewRatings } from './interviewRating.schema';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../emailService/emailService.service'
import { Unit } from 'src/unit/unit.schema';
import { Modules } from 'src/module/module.schema';
import { UserProgressStatus } from 'src/users/userProgressStatus.schema';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(InterviewerAvailabilities.name) private interviewerAvailabilityModel: Model<InterviewerAvailabilities>,
    @InjectModel(UserBookings.name) private userBookingsModel: Model<UserBookings>,
    @InjectModel(InterviewerActivity.name) private InterviewerActivityModel: Model<InterviewerActivity>,
    @InjectModel(Interviewer.name) private InterviewerModel: Model<Interviewer>,
    @InjectModel(Gems.name) private gemsModel: Model<Gems>,
    @InjectModel(User.name) private UsersModel: Model<User>,
    @InjectModel(UserEarnings.name) private userEarningsModel: Model<UserEarnings>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(InterviewRatings.name) private interviewRatingModel: Model<ReviewDto>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(Unit.name) private unitsModel: Model<Unit>,
    @InjectModel(Modules.name) private modulesModel: Model<Modules>,
    @InjectModel(UserProgressStatus.name) private usersProgressStatusModel: Model<UserProgressStatus>,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
  ) { }

  private async generateFrequencyId() {
    const nextId = await this.interviewerAvailabilityModel.countDocuments() + 1;
    return `FR${nextId.toString().padStart(4, '0')}`;
  }

  async getHolidayOf(startDateTime: any, endDateTime: any) {
    return await this.interviewerAvailabilityModel.find({
      type: 'HOLIDAY',
      status: 'ACTIVE',
      startDateTime: { $lte: new Date(endDateTime) },
      endDateTime: { $gte: new Date(startDateTime) }
    });
  }

  async getLeaveOf(startDateTime: any, endDateTime: any, interviewerId: string) {
    return await this.interviewerAvailabilityModel.find({
      type: 'LEAVE',
      status: 'ACTIVE',
      interviewer: interviewerId,
      startDateTime: { $lte: new Date(endDateTime) },
      endDateTime: { $gte: new Date(startDateTime) }
    });
  }

  async getAvailabilityOf(startDateTime: any, endDateTime: any, interviewerId: string) {
    return await this.interviewerAvailabilityModel.find({
      type: 'AVAILABILITY',
      status: 'ACTIVE',
      interviewer: interviewerId,
      startDateTime: { $lte: new Date(endDateTime) },
      endDateTime: { $gte: new Date(startDateTime) }
    });
  }

  genearTimeSlots = (startDateTime: any, endDateTime: any, duration: number) => {
    const slots = [];
    const slotDuration = Number(duration);
    let slotStartTime = moment.utc(startDateTime);
    let slotEndTime = moment.utc(slotStartTime.format()).add(slotDuration, 'minutes');
    do {
      slots.push({
        slotStartTime: slotStartTime.format(),
        slotEndTime: slotEndTime.format(),
        duration: slotDuration,
        available: true
      });

      slotStartTime = slotStartTime.add(slotDuration, 'minutes');
      slotEndTime = slotEndTime.add(slotDuration, 'minutes');

    } while (slotEndTime.isBefore(moment.utc(endDateTime).add(1, 'minutes')));
    return slots;
  }

  async saveAvailabilityPayload(availablityPayload: any[], holidaysOverlap: any[], leavesOverlap: any[], availabilityOverlap: any[]) {
    let saved = [];
    let message = '';
    let code = '';
    let status = 'error';

    if (availablityPayload.length > 0) {
      saved = await this.interviewerAvailabilityModel.create(availablityPayload);
      status = 'success';
      code = '4200';
      message = 'Availabilty saved. ';
    }

    if (availablityPayload.length === 0) {
      status = 'error';
      code = '5025';
      message = 'Availabilty not saved. ';
    }

    if (holidaysOverlap.length) {
      message += 'Some availability skipped due to holidays overlap. ';
    }

    if (leavesOverlap.length) {
      message += 'Some availability skipped due to leaves overlap. ';
    }

    if (availabilityOverlap.length) {
      message += 'Some availability skipped due to timing clash. ';
    }

    return {// response for the no frequency
      status: status,
      code: code,
      data: {
        message: message,
        availabilitySaved: saved,
        holidaysOverlap: holidaysOverlap,
        leavesOverlap: leavesOverlap,
        availabilityOverlap: availabilityOverlap
      }
    }
  }

  async saveAvailability(interviewerAvailabilityDto: InterviewerAvailabilityDto, interviewerId: string) {
    const frequencyId = await this.generateFrequencyId()
    if (interviewerAvailabilityDto.frequency === 'NONE') {
      const nonePayload: any[] = [];
      const serviceDays = interviewerAvailabilityDto.serviceDays;
      const holidaysOverlap: any[] = [];
      const leavesOverlap: any[] = [];
      const availabilityOverlap: any[] = [];
      for (let i = 0; i < serviceDays.length; i++) {
        // checking the overlaps for single frequency
        const holidayExist = await this.getHolidayOf(serviceDays[i].startDateTime, serviceDays[i].endDateTime);
        const leaveExist = await this.getLeaveOf(serviceDays[i].startDateTime, serviceDays[i].endDateTime, interviewerId);
        const availityExist = await this.getAvailabilityOf(serviceDays[i].startDateTime, serviceDays[i].endDateTime, interviewerId);

        if (holidayExist.length) {
          holidaysOverlap.push({
            startDateTime: serviceDays[i].startDateTime,
            endDateTime: serviceDays[i].endDateTime,
          });
        } else if (leaveExist.length) {
          leavesOverlap.push({
            startDateTime: serviceDays[i].startDateTime,
            endDateTime: serviceDays[i].endDateTime,
          });
        } else if (availityExist.length) {
          availabilityOverlap.push({
            startDateTime: serviceDays[i].startDateTime,
            endDateTime: serviceDays[i].endDateTime,
          });
        } else {
          const slots = this.genearTimeSlots(serviceDays[i].startDateTime, serviceDays[i].endDateTime, interviewerAvailabilityDto.slotDuration);
          nonePayload.push({
            scheduleName: interviewerAvailabilityDto.scheduleName,
            frequency: interviewerAvailabilityDto.frequency,
            slotDuration: interviewerAvailabilityDto.slotDuration,
            slots: slots,
            startDateTime: serviceDays[i].startDateTime,
            endDateTime: serviceDays[i].endDateTime,
            description: interviewerAvailabilityDto.description,
            interviewer: interviewerId,
            type: interviewerAvailabilityDto?.type ? interviewerAvailabilityDto?.type : 'AVAILABILITY',
            status: 'ACTIVE',
            frequencyId: frequencyId
          });
        }
      }

      // saving the availabilty for single frequency
      return await this.saveAvailabilityPayload(nonePayload, holidaysOverlap, leavesOverlap, availabilityOverlap);
    }

    // logic for weekly frequencly starts here
    if (interviewerAvailabilityDto.frequency === 'WEEKLY') {
      const startDate = moment.utc(interviewerAvailabilityDto.startDate);
      const endDate = moment.utc(interviewerAvailabilityDto.endDate);
      const weeklyPayload: any[] = [];
      const holidaysOverlap: any[] = [];
      const leavesOverlap: any[] = [];
      const availabilityOverlap: any[] = [];

      for (let m = moment.utc(startDate); m.isBefore(endDate); m.add(1, 'days')) { // iterating between two dates
        const serviceDays = interviewerAvailabilityDto.serviceDays;
        for (let i = 0; i < serviceDays.length; i++) { // iterating servcie days
          if (m.day() === serviceDays[i].dayOfWeek) { // comparing the day with service day
            let startDateTime = moment.utc(serviceDays[i].startDateTime);
            let endDateTime = moment.utc(serviceDays[i].endDateTime);

            startDateTime.set('date', m.get('date'));
            startDateTime.set('month', m.get('month'));
            startDateTime.set('year', m.get('year'));

            endDateTime.set('date', m.get('date'));
            endDateTime.set('month', m.get('month'));
            endDateTime.set('year', m.get('year'));

            // checking the overlap for weekly frequency
            const holidayExist = await this.getHolidayOf(startDateTime, endDateTime);
            const leaveExist = await this.getLeaveOf(startDateTime.format(), endDateTime.format(), interviewerId);
            const availityExist = await this.getAvailabilityOf(startDateTime, endDateTime, interviewerId);

            if (holidayExist.length) {
              holidaysOverlap.push({
                startDateTime: startDateTime,
                endDateTime: endDateTime,
              });
            } else if (leaveExist.length) {
              leavesOverlap.push({
                startDateTime: startDateTime,
                endDateTime: endDateTime,
              });
            } else if (availityExist.length) {
              availabilityOverlap.push({
                startDateTime: startDateTime,
                endDateTime: endDateTime,
              });
            } else {
              const slots = this.genearTimeSlots(startDateTime, endDateTime, interviewerAvailabilityDto.slotDuration);
              weeklyPayload.push({
                frequencyId: frequencyId,
                weeksOfMonth: interviewerAvailabilityDto.weeksOfMonth,
                scheduleName: interviewerAvailabilityDto.scheduleName,
                frequency: interviewerAvailabilityDto.frequency,
                slotDuration: interviewerAvailabilityDto.slotDuration,
                slots: slots,
                startDateTime: startDateTime.format(),
                endDateTime: endDateTime.format(),
                description: interviewerAvailabilityDto.description,
                interviewer: interviewerId,
                type: 'AVAILABILITY',
                status: 'ACTIVE'
              });
            }
          }
        }
      }
      // saving the availabilty for weekly frequency
      return await this.saveAvailabilityPayload(weeklyPayload, holidaysOverlap, leavesOverlap, availabilityOverlap);
    }

    // logic for montly frequencly starts here
    if (interviewerAvailabilityDto.frequency === 'MONTHLY') {
      const startDate = moment.utc(interviewerAvailabilityDto.startDate);
      const endDate = moment.utc(interviewerAvailabilityDto.endDate);
      const monthlyPayload: any[] = [];
      const holidaysOverlap: any[] = [];
      const leavesOverlap: any[] = [];
      const availabilityOverlap: any[] = [];

      for (let m = moment.utc(startDate); m.isBefore(endDate); m.add(1, 'days')) { // iterating between two dates
        const serviceDays = interviewerAvailabilityDto.serviceDays;
        const monthWeek = m.week() - moment.utc(m).startOf('month').week() + 1;
        for (let i = 0; i < serviceDays.length; i++) { // iterating servcie days
          if (interviewerAvailabilityDto.weeksOfMonth.includes(monthWeek) && m.day() === serviceDays[i].dayOfWeek) { // comparing the day with service day
            console.log('Week:' + monthWeek, m.format('YYYY-MM-DD ddd'));
            let startDateTime = moment.utc(serviceDays[i].startDateTime);
            let endDateTime = moment.utc(serviceDays[i].endDateTime);

            startDateTime.set('date', m.get('date'));
            startDateTime.set('month', m.get('month'));
            startDateTime.set('year', m.get('year')); m.week()

            endDateTime.set('date', m.get('date'));
            endDateTime.set('month', m.get('month'));
            endDateTime.set('year', m.get('year'));

            // checking the overlap for monthly frequency
            const holidayExist = await this.getHolidayOf(startDateTime, endDateTime);
            const leaveExist = await this.getLeaveOf(startDateTime, endDateTime, interviewerId);
            const availityExist = await this.getAvailabilityOf(startDateTime, endDateTime, interviewerId);

            if (holidayExist.length) {
              holidaysOverlap.push({
                startDateTime: startDateTime,
                endDateTime: endDateTime,
              });
            } else if (leaveExist.length) {
              leavesOverlap.push({
                startDateTime: startDateTime,
                endDateTime: endDateTime,
              });
            } else if (availityExist.length) {
              availabilityOverlap.push({
                startDateTime: startDateTime,
                endDateTime: endDateTime,
              });
            } else {
              const slots = this.genearTimeSlots(startDateTime, endDateTime, interviewerAvailabilityDto.slotDuration);
              monthlyPayload.push({
                frequencyId: frequencyId,
                weeksOfMonth: interviewerAvailabilityDto.weeksOfMonth,
                scheduleName: interviewerAvailabilityDto.scheduleName,
                frequency: interviewerAvailabilityDto.frequency,
                slotDuration: interviewerAvailabilityDto.slotDuration,
                slots: slots,
                startDateTime: startDateTime.format(),
                endDateTime: endDateTime.format(),
                description: interviewerAvailabilityDto.description,
                interviewer: interviewerId,
                type: 'AVAILABILITY',
                status: 'ACTIVE'
              });
            }

          }
        }
      }
      // saving the availabilty for weekly frequency
      return await this.saveAvailabilityPayload(monthlyPayload, holidaysOverlap, leavesOverlap, availabilityOverlap);
    }
    return;
  }

  async checkOverlap(overlapDto: any, interviewerId: string) {
    return await this.getLeaveOf(overlapDto.startDateTime, overlapDto.endDateTime, interviewerId);
  }

  async getAvailabilities(match: any, data: any = {}) {
    const limit = data.limit;
    const skipValue = data.skipValue;
    return await this.interviewerAvailabilityModel.aggregate([
      { $match: { $and: match } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'userbookings',
          localField: '_id',
          foreignField: 'availabilityId',
          as: 'bookings',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                availabilityId: "$availabilityId",
                user: {
                  userId: "$user._id",
                  firstName: "$user.firstName",
                  lastName: "$user.lastName",
                  email: "$user.email",
                  mobileNumber: "$user.mobileNumber",
                  profileImage: "$user.profileImage"
                },
                startDateTime: "$startDateTime",
                endDateTime: "$endDateTime",
                status: "$status",
                meetingLink: "$meetingLink",
                interviewerRejectReason: "$interviewerRejectReason",
                interviewerCancelReason: "$interviewerCancelReason",
                userCancelReason: "$userCancelReason"
              }
            }
          ]
        },
      },
      {
        $project: {
          _id: 0,
          availabilityId: "$_id",
          scheduleName: 1,
          slotDuration: 1,
          startDateTime: 1,
          endDateTime: 1,
          description: 1,
          bookings: 1,
          type: 1,
          frequency: 1,
          totalBookings: {
            $size: "$bookings"
          },
          pendingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "PENDING"] }
              }
            }
          },
          acceptedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "ACCEPTED"] }
              }
            }
          },
          rescheduledCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "RESCHEDULED"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "COMPLETED"] }
              }
            }
          }
        }
      },
      { $skip: skipValue },
      { $limit: limit }
    ]);
  }

  async getAllAvailabilitiesForAdmin(queryParams) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;

    const match: any = {
      status: { $ne: 'DELETED' }
    };

    if (queryParams.type) {
      match.type = queryParams.type;
    }

    if (queryParams.scheduleName) {
      match.scheduleName = {
        $regex: new RegExp(queryParams.scheduleName.trim(), 'i')
      };
    }

    if (queryParams.interviewerId) {
      match.interviewer = new ObjectId(queryParams.interviewerId);
    }

    if (queryParams.fromDate && queryParams.toDate) {
      match.startDateTime = {
        $gte: moment.utc(queryParams.fromDate).toDate(),
        $lte: moment.utc(queryParams.toDate).toDate()
      };
    } else if (queryParams.fromDate) {
      match.startDateTime = {
        $gte: moment.utc(queryParams.fromDate).toDate()
      };
    } else if (queryParams.toDate) {
      match.startDateTime = {
        $lte: moment.utc(queryParams.toDate).toDate()
      };
    }

    let interviewerData = [];
    if (queryParams.interviewer) {
      const searchTerm = queryParams.interviewer.trim();
      interviewerData = await this.InterviewerModel.aggregate([
        {
          $match: {
            $or: [
              { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: searchTerm, options: 'i' } } },
              { firstName: { $regex: searchTerm, $options: 'i' } },
              { lastName: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } },
            ]
          }
        },
        {
          $project: {
            _id: 1
          }
        }
      ]);
      if (interviewerData.length === 0) {
        return { availabilities: [], count: 0 };
      }
    }
    const interviewIds = interviewerData.map(avail => avail._id);
    if (interviewIds.length > 0) {
      match.interviewer = { $in: interviewIds.map(id => new ObjectId(id)) };
    }

    const availabilitiesPipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'interviewers',
          localField: 'interviewer',
          foreignField: '_id',
          as: 'interviewer',
        }
      },
      { $unwind: { path: '$interviewer', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'admins',
          localField: 'admin',
          foreignField: '_id',
          as: 'admin',
        }
      },
      { $unwind: { path: '$admin', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'userbookings',
          localField: '_id',
          foreignField: 'availabilityId',
          as: 'bookings',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                availabilityId: "$availabilityId",
                user: {
                  userId: "$user._id",
                  firstName: "$user.firstName",
                  lastName: "$user.lastName",
                  email: "$user.email",
                  mobileNumber: "$user.mobileNumber",
                  profileImage: "$user.profileImage"
                },
                startDateTime: "$startDateTime",
                endDateTime: "$endDateTime",
                status: "$status",
                meetingLink: "$meetingLink",
                interviewerRejectReason: "$interviewerRejectReason",
                interviewerCancelReason: "$interviewerCancelReason",
                userCancelReason: "$userCancelReason"
              }
            }
          ]
        },
      },
      {
        $project: {
          _id: 0,
          availabilityId: "$_id",
          scheduleName: 1,
          slotDuration: 1,
          startDateTime: 1,
          endDateTime: 1,
          description: 1,
          bookings: 1,
          type: 1,
          frequency: 1,
          createdAt: 1,
          updatedAt: 1,
          interviewer: {
            id: "$interviewer._id",
            firstName: "$interviewer.firstName",
            lastName: "$interviewer.lastName",
            email: "$interviewer.email",
            mobileNumber: "$interviewer.mobileNumber",
            qualification: "$interviewer.qualification",
            organization: "$interviewer.organization",
            gender: "$interviewer.gender",
            profileImage: "$interviewer.profileImage",
            aboutMe: "$interviewer.aboutMe",
          },
          admin: {
            id: "$admin._id",
            firstName: "$admin.firstName",
            lastName: "$admin.lastName",
            email: "$admin.email",
            mobileNumber: "$admin.mobileNumber"
          },
          totalBookings: { $size: "$bookings" },
          pendingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "PENDING"] }
              }
            }
          },
          acceptedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "ACCEPTED"] }
              }
            }
          },
          rescheduledCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "RESCHEDULED"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "COMPLETED"] }
              }
            }
          }
        }
      },
    ];

    const availabilities = await this.interviewerAvailabilityModel.aggregate(availabilitiesPipeline);

    const countPipeline: PipelineStage[] = [
      { $match: match },
      { $count: "count" }
    ];
    const result = await this.interviewerAvailabilityModel.aggregate(countPipeline).exec();
    const count = result.length > 0 ? result[0].count : 0;
    return { availabilities, count };
  }

  async getInterviewerAvailabilities(queryParams: any, interviewerId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    const interviewerObjectId = new ObjectId(interviewerId);
    const match = [
      { status: { $ne: 'DELETED' } },
      { interviewer: interviewerObjectId },
    ]

    if (queryParams.fromDate && queryParams.toDate) {
      match['startDateTime'] = {
        $gte: moment.utc(queryParams.fromDate),
        $lte: moment.utc(queryParams.toDate)
      }
    } else if (queryParams.fromDate) {
      match['startDateTime'] = {
        $gte: moment.utc(queryParams.fromDate)
      }
    } else if (queryParams.toDate) {
      match['startDateTime'] = {
        $lte: moment.utc(queryParams.toDate)
      }
    } else {
      match['startDateTime'] = {
        $gte: moment.utc().startOf('month'),
        $lte: moment.utc().endOf('month')
      }
    }

    return await this.interviewerAvailabilityModel.aggregate([
      { $match: { $or: [{ type: 'HOLIDAY' }, { $and: match }] } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'userbookings',
          localField: '_id',
          foreignField: 'availabilityId',
          as: 'bookings',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                availabilityId: "$availabilityId",
                user: {
                  userId: "$user._id",
                  firstName: "$user.firstName",
                  lastName: "$user.lastName",
                  email: "$user.email",
                  mobileNumber: "$user.mobileNumber",
                  profileImage: "$user.profileImage"
                },
                startDateTime: "$startDateTime",
                endDateTime: "$endDateTime",
                status: "$status",
                meetingLink: "$meetingLink",
                interviewerRejectReason: "$interviewerRejectReason",
                interviewerCancelReason: "$interviewerCancelReason",
                userCancelReason: "$userCancelReason"
              }
            }
          ]
        },
      },
      {
        $project: {
          _id: 0,
          availabilityId: "$_id",
          scheduleName: 1,
          slotDuration: 1,
          startDateTime: 1,
          endDateTime: 1,
          description: 1,
          bookings: 1,
          type: 1,
          frequency: 1,
          totalBookings: {
            $size: "$bookings"
          },
          pendingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "PENDING"] }
              }
            }
          },
          acceptedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "ACCEPTED"] }
              }
            }
          },
          rescheduledCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "RESCHEDULED"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "COMPLETED"] }
              }
            }
          }
        }
      },
    ]);
  }

  async getAdminInterviewerAvailabilities(interviewerId: string, queryParams: any) {
    const limit = queryParams && queryParams.limit ? Number(queryParams.limit) : 500;
    const page = queryParams && queryParams.page ? Number(queryParams.page) : 1;
    const skipValue = (page - 1) * limit;
    const data = { limit, skipValue };
    const ObjectId = mongoose.Types.ObjectId;
    const interviewerObjectId = new ObjectId(interviewerId);
    const match = [
      { status: { $ne: 'DELETED' } },
      { interviewer: interviewerObjectId },
    ];
    const count = await this.interviewerAvailabilityModel.countDocuments({ $and: match }).exec();
    const interviewerAvailabilities = await this.getAvailabilities(match, data);
    return { interviewerAvailabilities, count };
  }

  async getHolidayAvailabilities() {
    const match = [
      { status: { $ne: 'DELETED' } },
      { type: 'HOLIDAY' },
    ]
    return await this.getAvailabilities(match);
  }

  async getLeaveAvailabilities(interviewerId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    const interviewerObjectId = new ObjectId(interviewerId);
    const match = [
      { status: { $ne: 'DELETED' } },
      { interviewer: interviewerObjectId },
      { type: 'LEAVE' },
    ]
    return await this.getAvailabilities(match);
  }

  async getAvailabilitiesInterviews(interviewerId: string) {
    const ObjectId = mongoose.Types.ObjectId;
    const interviewerObjectId = new ObjectId(interviewerId);
    const match = [
      { status: { $ne: 'DELETED' } },
      { interviewer: interviewerObjectId },
      { type: 'AVAILABILITY' },
    ]
    return await this.getAvailabilities(match);
  }

  async getAllInterviews(queryParams: any) {

    const match: any = { status: { $ne: 'DELETED' }, };

    if (queryParams.interviewerId) {
      const interviewerObjectId = new ObjectId(queryParams.interviewerId);
      match["interviewer"] = interviewerObjectId;
    }

    if (queryParams.fromDate && queryParams.toDate) {
      match['startDateTime'] = {
        $gte: new Date(queryParams.fromDate),
        $lte: new Date(queryParams.toDate)
      }
    } else if (queryParams.fromDate) {
      match['startDateTime'] = {
        $gte: new Date(queryParams.fromDate),
      }
    } else if (queryParams.toDate) {
      match['startDateTime'] = {
        $lte: new Date(queryParams.toDate)
      }
    } else {
      match['startDateTime'] = {
        $gte: new Date(moment.utc().startOf('month').format()),
        $lte: new Date(moment.utc().endOf('month').format())
      }
    }

    return await this.interviewerAvailabilityModel.aggregate([
      { $match: match },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'userbookings',
          localField: '_id',
          foreignField: 'availabilityId',
          as: 'bookings',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                availabilityId: "$availabilityId",
                user: {
                  userId: "$user._id",
                  firstName: "$user.firstName",
                  lastName: "$user.lastName",
                  email: "$user.email",
                  mobileNumber: "$user.mobileNumber",
                  profileImage: "$user.profileImage"
                },
                startDateTime: "$startDateTime",
                endDateTime: "$endDateTime",
                status: "$status",
                meetingLink: "$meetingLink",
                interviewerRejectReason: "$interviewerRejectReason",
                interviewerCancelReason: "$interviewerCancelReason",
                userCancelReason: "$userCancelReason"
              }
            }
          ]
        },
      },
      {
        $project: {
          _id: 0,
          availabilityId: "$_id",
          scheduleName: 1,
          slotDuration: 1,
          startDateTime: 1,
          endDateTime: 1,
          description: 1,
          bookings: 1,
          type: 1,
          frequency: 1,
          totalBookings: {
            $size: "$bookings"
          },
          pendingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "PENDING"] }
              }
            }
          },
          acceptedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "ACCEPTED"] }
              }
            }
          },
          rescheduledCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "RESCHEDULED"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "item",
                cond: { $eq: ["$$item.status", "COMPLETED"] }
              }
            }
          }
        }
      },
    ]);
  }

  async getAvailabilityForUsers(queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;

    const match = {
      $or: [{ status: 'ACTIVE', }],

    };

    if (queryParams.rescheduleStartDate) {
      match["startDateTime"] = {
        $gte: moment.utc(queryParams.rescheduleStartDate).add(1, 'day').toDate()
      }
    } else {
      match["startDateTime"] = {
        $gte: moment.utc().startOf('day').add(1, 'day').toDate()
      };
    }

    if (queryParams.interviewerId) {
      match['interviewer'] = queryParams.interviewerId
    }

    const interviews = await this.interviewerAvailabilityModel.find(match)
      .sort({ startDateTime: 1 })
      .skip(skipValue)
      .limit(parsedLimit)
      .populate('interviewer', 'id firstName lastName gender profileImage qualification experience organization organizationLogo aboutMe');

    const count = await this.interviewerAvailabilityModel.countDocuments(match).exec()
    return { interviews, count }
  }

  async getAvailabilityById(id: string) {
    return await this.interviewerAvailabilityModel.findById(id);
  }

  async getInterviewerAvailabilityById(id: string, interviewerId: string) {
    return await this.interviewerAvailabilityModel.findOne({
      _id: new ObjectId(id),
      interviewer: new ObjectId(interviewerId)
    });

  }

  async getBookingByAvailabilityId(applyDto: any) {
    const { startDateTime, endDateTime } = applyDto;
    const ObjectId = mongoose.Types.ObjectId;
    const availabilityId = new ObjectId(applyDto.availabilityId);
    const existingBookings = await this.userBookingsModel.find({
      availabilityId: availabilityId,
      $or: [
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gt: startDateTime }
        },
        {
          startDateTime: startDateTime,
          endDateTime: endDateTime
        }
      ]
    }).populate('user')
    return existingBookings[0]
  }

  async getInterviewerBooking(applyDto: any) {
    const { startDateTime, endDateTime } = applyDto;
    const ObjectId = mongoose.Types.ObjectId;
    const availabilityId = new ObjectId(applyDto.availabilityId);
    const existingBookings = await this.userBookingsModel.find({
      availabilityId: availabilityId,
      $or: [
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gt: startDateTime }
        },
        {
          startDateTime: startDateTime,
          endDateTime: endDateTime
        }
      ]
    }).populate('user')
    return existingBookings[0]
  }

  async getBookingById(id: string) {
    return await this.userBookingsModel.findById(id).populate('availabilityId', 'interviewer');
  }


  async saveResheduleBooking(applyDto: ApplyDto, slots: any[]) {
    let booked;
    await this.userBookingsModel.updateOne({
      _id: applyDto.bookingId
    }, {
      availabilityId: applyDto.availabilityId,
      startDateTime: applyDto.startDateTime,
      endDateTime: applyDto.endDateTime,
      status: 'RESCHEDULED',
    });
    await this.userBookingsModel.updateOne({
      _id: applyDto.bookingId
    }, {
      $inc: { rescheduledCount: 1 }
    })
    booked = { id: applyDto.bookingId };
    const index = slots.findIndex((item) => item.slotStartTime === applyDto.startDateTime && item.slotEndTime === applyDto.endDateTime)

    slots[index].available = false;
    await this.interviewerAvailabilityModel.updateOne({ _id: applyDto.availabilityId }, { slots: slots });
    return booked;
  }

  async saveUserBooking(applyDto: ApplyDto, userId: string, slots: any[]) {
    let booked;
    if (applyDto.bookingId) {
      await this.userBookingsModel.updateOne({
        _id: applyDto.bookingId
      }, {
        availabilityId: applyDto.availabilityId,
        startDateTime: applyDto.startDateTime,
        endDateTime: applyDto.endDateTime,
        status: 'RESCHEDULED',
      });
      await this.userBookingsModel.updateOne({
        _id: applyDto.bookingId
      }, {
        $inc: { rescheduledCount: 1 }
      })
      booked = { id: applyDto.bookingId };
    } else {
      booked = await this.userBookingsModel.create({
        availabilityId: applyDto.availabilityId,
        user: userId,
        startDateTime: applyDto.startDateTime,
        endDateTime: applyDto.endDateTime,
        status: 'PENDING'
      });
      const gems = await this.findGemsByName('BOOK_INTERVIEW');
      const gemsToReduce = -1 * gems.value;
      // making the gems value as negative value so that while using $inc it will get reduces
      await this.UsersModel.updateOne({ _id: userId }, { $inc: { gemValue: gemsToReduce } });
      this.userEarningsModel.create({//saving user earings while creating user as premium bonus
        userId: userId,
        activity: "Spent Gems",
        action: "booked_interview",
        reason: 'You have successfully spent gems to book an interview.',
        gemValue: gems.value,
        xpValue: 0,
        megathilValue: 0,
        earnedOrSpent: 'SPENT',
      }).then(() => { });
      this.transactionModel.create({
        item: "GEMS",
        quantity: gems.value,
        userId: userId,
        refNumber: null,
        payment: null,
        reason: 'You have successfully spent gems to book an interview.',
        status: 'SUCCESS'
      }).then(() => { });
    }
    const aggregationResult = await this.userBookingsModel.aggregate([
      {
        $match: { _id: new ObjectId(applyDto.bookingId) },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'intervieweravailabilities',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availabilityDetails',
        },
      },
      { $unwind: { path: '$availabilityDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'interviewers',
          localField: 'availabilityDetails.interviewer',
          foreignField: '_id',
          as: 'interviewerDetails',
        },
      },
      { $unwind: { path: '$interviewerDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
          scheduleName: '$availabilityDetails.scheduleName',
          interviewerFirstName: '$interviewerDetails.firstName',
          interviewerLastName: '$interviewerDetails.lastName',
          interviewerEmail: '$interviewerDetails.email',
        },
      },
    ]);
    // Formatting the date as dd/mm/yyyy
    const formattedDate = moment.utc(applyDto.startDateTime).format('DD/MM/YYYY');
    // Formatting the time (start and end time)
    const startTime = moment.utc(applyDto.startDateTime).format('HH:mm A');
    const endTime = moment.utc(applyDto.endDateTime).format('HH:mm A');
    // email sent once user interview book is success
    const sendEmail = process.env.SEND_EMAIL;
    if (sendEmail && sendEmail === 'true' && aggregationResult.length > 0) {
      try {
        const templateData = {
          "interviewerName": `${aggregationResult[0].interviewerFirstName} ${aggregationResult[0].interviewerLastName}`,
          "message": "I hope this message finds you well.",
          "userName": `${aggregationResult[0].firstName} ${aggregationResult[0].lastName}`,
          "date": formattedDate,
          "time": `${startTime} - ${endTime}`
        }
        await this.emailService.sendMail(
          aggregationResult[0].interviewerEmail,
          "Welcome to Our Service",
          "INTERVIEWERBOOKING",
          templateData
        ).then(() => { })
      } catch { }
    }
    const index = slots.findIndex((item) => item.slotStartTime === applyDto.startDateTime && item.slotEndTime === applyDto.endDateTime)

    slots[index].available = false;
    await this.interviewerAvailabilityModel.updateOne({ _id: applyDto.availabilityId }, { slots: slots });
    return booked;
  }

  async findUserPastBookings(queryParams: any, userId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;

    const ObjectId = mongoose.Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const match = {
      user: userObjectId,
      status: "COMPLETED",
      endDateTime: {
        $lte: new Date(moment.utc().toString())
      },
    };

    const interviews = await this.userBookingsModel.aggregate([
      { $match: match },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'intervieweravailabilities',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availability',
          pipeline: [
            {
              $lookup: {
                from: 'interviewers',
                localField: 'interviewer',
                foreignField: '_id',
                as: 'interviewerDetails'
              }
            },
            { $unwind: { path: '$interviewerDetails', preserveNullAndEmptyArrays: true } },
          ]
        }
      },
      {
        $lookup: {
          from: 'interviewratings',
          let: { bookingId: '$_id', bookingStatus: '$status' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$bookingId', '$$bookingId'] },
                    { $eq: ['$$bookingStatus', 'COMPLETED'] }
                  ]
                }
              }
            },
            {
              $project: {
                review: 1,
                rating: 1,
                _id: 0
              }
            }
          ],
          as: 'userReviews'
        }
      },
      { $unwind: { path: '$availability', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$userReviews', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userReviews: 1,
          _id: 0,
          bookingId: "$_id",
          availabilityId: 1,
          user: 1,
          interviewerId: "$availability.interviewer",
          availability: {
            scheduleName: "$availability.scheduleName",
            slotDuration: "$availability.slotDuration",
            description: "$availability.description",
          },
          interviewerDetails: {
            firstName: "$availability.interviewerDetails.firstName",
            lastName: "$availability.interviewerDetails.lastName",
            email: "$availability.interviewerDetails.email",
            gender: "$availability.interviewerDetails.gender",
            profileImage: "$availability.interviewerDetails.profileImage",
            aboutMe: "$availability.interviewerDetails.aboutMe",
            experience: "$availability.interviewerDetails.experience",
            mobileNumber: "$availability.interviewerDetails.mobileNumber",
            qualification: "$availability.interviewerDetails.qualification",
            organization: "$availability.interviewerDetails.organization",
            organizationLogo: "$availability.interviewerDetails.organizationLogo",
          },
          startDateTime: 1,
          endDateTime: 1,
          meetingLink: 1,
          interviewNote: 1,
          interviewerRejectReason: 1,
          interviewerCancelReason: 1,
          userCancelReason: 1,
          rescheduledCount: 1,
          fluency: 1,
          engery: 1,
          speechRate: 1,
          vocabulary: 1,
          contentRelevance: 1,
          interviewerComments: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,

        }
      },
    ]);


    const count = await this.userBookingsModel.countDocuments(match).exec()
    return { interviews, count }
  }

  async findUserUpcomingInterviews(queryParams: any, userId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;

    const ObjectId = mongoose.Types.ObjectId;
    const userObjectId = new ObjectId(userId);
    const match = {
      user: userObjectId,
      startDateTime: {
        $gte: new Date(moment.utc().toString())
      }
    };

    const interviews = await this.userBookingsModel.aggregate([
      { $match: match },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'intervieweravailabilities',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availability',
          pipeline: [
            {
              $lookup: {
                from: 'interviewers',
                localField: 'interviewer',
                foreignField: '_id',
                as: 'interviewerDetails'
              }
            },
            { $unwind: { path: '$interviewerDetails', preserveNullAndEmptyArrays: true } },
          ]
        }
      },
      { $unwind: { path: '$availability', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          bookingId: "$_id",
          availabilityId: 1,
          user: 1,
          interviewerId: "$availability.interviewer",
          availability: {
            scheduleName: "$availability.scheduleName",
            slotDuration: "$availability.slotDuration",
            description: "$availability.description",
          },
          interviewerDetails: {
            id: "$availability.interviewerDetails._id",
            firstName: "$availability.interviewerDetails.firstName",
            lastName: "$availability.interviewerDetails.lastName",
            email: "$availability.interviewerDetails.email",
            mobileNumber: "$availability.interviewerDetails.mobileNumber",
            qualification: "$availability.interviewerDetails.qualification",
            experience: "$availability.interviewerDetails.experience",
            organization: "$availability.interviewerDetails.organization",
            organizationLogo: "$availability.interviewerDetails.organizationLogo",
            gender: "$availability.interviewerDetails.gender",
            profileImage: "$availability.interviewerDetails.profileImage",
            aboutMe: "$availability.interviewerDetails.aboutMe",
          },
          startDateTime: 1,
          endDateTime: 1,
          meetingLink: 1,
          interviewNote: 1,
          interviewerRejectReason: 1,
          interviewerCancelReason: 1,
          userCancelReason: 1,
          rescheduledCount: 1,
          fluency: 1,
          engery: 1,
          speechRate: 1,
          vocabulary: 1,
          contentRelevance: 1,
          interviewerComments: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
    ]);


    const count = await this.userBookingsModel.countDocuments(match).exec()
    return { interviews, count }
  }

  async cancelBookingByUser(cancelDto: CancelDto) {
    return await this.userBookingsModel.updateOne(
      { _id: cancelDto.bookingId },
      {
        status: 'CANCELED_BY_USER',
        userCancelReason: cancelDto.reason
      }
    );
  }

  async getBookings(match: any, interviwerId: any, queryParams: any) {
    return await this.userBookingsModel.aggregate([
      { $match: { $and: match } },
      { $sort: { createdAt: -1 } },
      { $skip: queryParams.skipValue },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'intervieweravailabilities',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availability',
          pipeline: [
            {
              $lookup: {
                from: 'interviewers',
                localField: 'interviewer',
                foreignField: '_id',
                as: 'interviewerDetails'
              }
            },
            { $unwind: { path: '$interviewerDetails', preserveNullAndEmptyArrays: true } },
          ]
        }
      },
      { $unwind: { path: '$availability', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          bookingId: "$_id",
          availabilityId: 1,
          interviewerId: "$availability.interviewer",
          availability: {
            scheduleName: "$availability.scheduleName",
            slotDuration: "$availability.slotDuration",
            description: "$availability.description",
          },
          interviewerDetails: {
            firstName: "$availability.interviewerDetails.firstName",
            lastName: "$availability.interviewerDetails.lastName",
            email: "$availability.interviewerDetails.email",
            mobileNumber: "$availability.interviewerDetails.mobileNumber",
            experience: "$availability.interviewerDetails.experience",
            qualification: "$availability.interviewerDetails.qualification",
            qualificationLogo: "$availability.interviewerDetails.qualificationLogo",
            organization: "$availability.interviewerDetails.organization",
            gender: "$availability.interviewerDetails.gender",
            profileImage: "$availability.interviewerDetails.profileImage",
            aboutMe: "$availability.interviewerDetails.aboutMe",
          },
          user: {
            userId: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            email: "$user.email",
            mobileNumber: "$user.mobileNumber",
            profileImage: "$user.profileImage"
          },
          startDateTime: 1,
          endDateTime: 1,
          meetingLink: 1,
          interviewNote: 1,
          interviewerRejectReason: 1,
          interviewerCancelReason: 1,
          userCancelReason: 1,
          fluency: 1,
          engery: 1,
          speechRate: 1,
          vocabulary: 1,
          contentRelevance: 1,
          interviewerComments: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          frequency: 1,
        }
      },
      { $match: { interviewerId: interviwerId } },
      { $limit: queryParams.limit },
    ]).exec()
  }

  async getBookingRequestsForInterviewer(queryParams: any, interviewerId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const limit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * limit;
    const ObjectId = mongoose.Types.ObjectId;
    const interviewerObjectId = new ObjectId(interviewerId);
    const match = [
      { status: { $in: ['PENDING', 'RESCHEDULED'] } },
    ]
    const data = { limit, skipValue };

    return await this.getBookings(match, interviewerObjectId, data);
  }


  async getBookingsForInterviewer(queryParams: any, interviewerId: string) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const limit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * limit;
    const ObjectId = mongoose.Types.ObjectId;
    const interviewerObjectId = new ObjectId(interviewerId);
    const match = [
      { status: { $nin: ['PENDING', 'RESCHEDULED', 'DELETED'] } }
    ];

    const commonPipeline = [
      { $match: { $and: match } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'intervieweravailabilities',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availability',
          pipeline: [
            {
              $lookup: {
                from: 'interviewers',
                localField: 'interviewer',
                foreignField: '_id',
                as: 'interviewerDetails'
              }
            },
            { $unwind: { path: '$interviewerDetails', preserveNullAndEmptyArrays: true } },
          ]
        }
      },
      { $unwind: { path: '$availability', preserveNullAndEmptyArrays: true } },
      { $match: { 'availability.interviewer': interviewerObjectId } }
    ];
    const bookingRequests = await this.userBookingsModel.aggregate([
      ...commonPipeline,
      { $sort: { updatedAt: -1 } },
      { $skip: skipValue },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          bookingId: "$_id",
          availabilityId: 1,
          interviewerId: "$availability.interviewer",
          availability: {
            scheduleName: "$availability.scheduleName",
            slotDuration: "$availability.slotDuration",
            description: "$availability.description",
          },
          interviewerDetails: {
            firstName: "$availability.interviewerDetails.firstName",
            lastName: "$availability.interviewerDetails.lastName",
            email: "$availability.interviewerDetails.email",
            mobileNumber: "$availability.interviewerDetails.mobileNumber",
            experience: "$availability.interviewerDetails.experience",
            qualification: "$availability.interviewerDetails.qualification",
            qualificationLogo: "$availability.interviewerDetails.qualificationLogo",
            organization: "$availability.interviewerDetails.organization",
            gender: "$availability.interviewerDetails.gender",
            profileImage: "$availability.interviewerDetails.profileImage",
            aboutMe: "$availability.interviewerDetails.aboutMe",
          },
          user: {
            userId: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            email: "$user.email",
            mobileNumber: "$user.mobileNumber",
            profileImage: "$user.profileImage"
          },
          startDateTime: 1,
          endDateTime: 1,
          meetingLink: 1,
          interviewNote: 1,
          interviewerRejectReason: 1,
          interviewerCancelReason: 1,
          userCancelReason: 1,
          fluency: 1,
          engery: 1,
          speechRate: 1,
          vocabulary: 1,
          contentRelevance: 1,
          interviewerComments: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          frequency: 1,
        }
      }
    ]).exec();

    const bookingCounts = await this.userBookingsModel.aggregate([
      ...commonPipeline,
      { $count: "totalCount" }
    ]).exec();

    const count = bookingCounts.length > 0 ? bookingCounts[0].totalCount : 0;

    return { bookingRequests, count };
  }


  async acceptUserBookingByInterviewer(acceptDto: AcceptDto) {
    const updateResult = await this.userBookingsModel.updateOne({
      _id: acceptDto.bookingId,
      status: { $in: ['PENDING', 'RESCHEDULED'] }
    }, {
      status: 'ACCEPTED',
      meetingLink: acceptDto.meetingLink,
      interviewNote: acceptDto.interviewNote
    });
    if (updateResult && updateResult.modifiedCount > 0) {
      const aggregationResult = await this.userBookingsModel.aggregate([
        {
          $match: { _id: new ObjectId(acceptDto.bookingId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'intervieweravailabilities',
            localField: 'availabilityId',
            foreignField: '_id',
            as: 'availabilityDetails',
          },
        },
        { $unwind: { path: '$availabilityDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$userDetails._id',
            deviceToken: '$userDetails.deviceToken',
            scheduleName: '$availabilityDetails.scheduleName',
          },
        },
      ]);

      if (aggregationResult && aggregationResult.length > 0) {
        const userId = aggregationResult[0].userId;
        const title = 'Interview Accepted';
        const body = `Your interview booking for ${aggregationResult[0].scheduleName} has been accepted.`;
        const deviceToken = aggregationResult[0].deviceToken;
        try {
          const notificationDto = this.notificationService.createNotificationDto(title, body, deviceToken);
          await this.notificationService.sentPushNotification(notificationDto);

          await this.notificationModel.create({
            userId: userId.toString(),
            title: "Interview Accepted",
            body: "Your interview booking has been accepted.",
            viewed: 'UNREAD'
          })
        } catch (error) {
          if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
            console.log(`Skipping invalid device token for user ${userId}: ${deviceToken}`);
            await this.UsersModel.updateOne(
              { _id: userId },
              { $set: { deviceToken: "" } }
            );
          } else {
            console.error(`Error sending notification to user ${userId}:`, error);
          }
        }
      }
    }
    return updateResult;
  }

  async rejectUserBookingByInterviewer(cancelDto: CancelDto) {
    const rejectResult = await this.userBookingsModel.updateOne({
      _id: cancelDto.bookingId,
      status: 'PENDING'
    }, {
      status: 'REJECTED',
      interviewerRejectReason: cancelDto.reason
    });
    if (rejectResult && rejectResult.modifiedCount > 0) {
      const aggregationResult = await this.userBookingsModel.aggregate([
        {
          $match: { _id: new ObjectId(cancelDto.bookingId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'intervieweravailabilities',
            localField: 'availabilityId',
            foreignField: '_id',
            as: 'availabilityDetails',
          },
        },
        { $unwind: { path: '$availabilityDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$userDetails._id',
            deviceToken: '$userDetails.deviceToken',
            scheduleName: '$availabilityDetails.scheduleName',
          },
        },
      ]);

      if (aggregationResult && aggregationResult.length > 0) {
        const userId = aggregationResult[0].userId;
        const title = 'Interview Rejected';
        const body = `Your interview booking for ${aggregationResult[0].scheduleName} has been rejected.`;
        const deviceToken = aggregationResult[0].deviceToken;
        try {
          const notificationDto = this.notificationService.createNotificationDto(title, body, deviceToken);
          await this.notificationService.sentPushNotification(notificationDto);

          await this.notificationModel.create({
            userId: userId.toString(),
            title: "Interview Rejected",
            body: "Your interview booking has been rejected.",
            viewed: 'UNREAD'
          })
        } catch (error) {
          if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
            console.log(`Skipping invalid device token for user ${userId}: ${deviceToken}`);
            await this.UsersModel.updateOne(
              { _id: userId },
              { $set: { deviceToken: "" } }
            );
          } else {
            console.error(`Error sending notification to user ${userId}:`, error);
          }
        }
      }
    }
    return rejectResult;
  }

  async completeUserBookingByInterviewer(completeDto: CompleteDto) {
    const updatePayload: any = {
      status: 'COMPLETED',
      fluency: completeDto.fluency,
      engery: completeDto.engery,
      speechRate: completeDto.speechRate,
      vocabulary: completeDto.vocabulary,
      contentRelevance: completeDto.contentRelevance,
      interviewerComments: completeDto.interviewerComments
    };
    const completeResult = await this.userBookingsModel.updateOne({ _id: completeDto.bookingId, status: 'ACCEPTED' }, updatePayload);
    if (completeResult && completeResult.modifiedCount > 0) {
      const aggregationResult = await this.userBookingsModel.aggregate([
        {
          $match: { _id: new ObjectId(completeDto.bookingId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'intervieweravailabilities',
            localField: 'availabilityId',
            foreignField: '_id',
            as: 'availabilityDetails',
          },
        },
        { $unwind: { path: '$availabilityDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$userDetails._id',
            deviceToken: '$userDetails.deviceToken',
            scheduleName: '$availabilityDetails.scheduleName',
          },
        },
      ]);

      if (aggregationResult && aggregationResult.length > 0) {
        const userId = aggregationResult[0].userId;
        const title = 'Interview Completed';
        const body = `Your interview booking for ${aggregationResult[0].scheduleName} has been completed.`;
        const deviceToken = aggregationResult[0].deviceToken;
        try {
          const notificationDto = this.notificationService.createNotificationDto(title, body, deviceToken);
          await this.notificationService.sentPushNotification(notificationDto);

          await this.notificationModel.create({
            userId: userId.toString(),
            title: "Interview Completed",
            body: "Your interview has been successfully completed.",
            viewed: 'UNREAD'
          })
        } catch (error) {
          if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
            console.log(`Skipping invalid device token for user ${userId}: ${deviceToken}`);
            await this.UsersModel.updateOne(
              { _id: userId },
              { $set: { deviceToken: "" } }
            );
          } else {
            console.error(`Error sending notification to user ${userId}:`, error);
          }
        }
      }
    }
    return completeResult;
  }

  async cancelUserBookingByInterviewer(cancelDto: CancelDto) {
    const cancelResult = await this.userBookingsModel.updateOne({ _id: cancelDto.bookingId, status: 'ACCEPTED' }, { status: 'CANCELED_BY_INTERVIEWER', interviewerCancelReason: cancelDto.reason });
    if (cancelResult && cancelResult.modifiedCount > 0) {
      const aggregationResult = await this.userBookingsModel.aggregate([
        {
          $match: { _id: new ObjectId(cancelDto.bookingId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'intervieweravailabilities',
            localField: 'availabilityId',
            foreignField: '_id',
            as: 'availabilityDetails',
          },
        },
        { $unwind: { path: '$availabilityDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: '$userDetails._id',
            deviceToken: '$userDetails.deviceToken',
            scheduleName: '$availabilityDetails.scheduleName',
          },
        },
      ]);

      if (aggregationResult && aggregationResult.length > 0) {
        const userId = aggregationResult[0].userId;
        const title = 'Interview Cancelled';
        const body = `Your interview booking for ${aggregationResult[0].scheduleName} has been cancelled.`;
        const deviceToken = aggregationResult[0].deviceToken;
        try {
          const notificationDto = this.notificationService.createNotificationDto(title, body, deviceToken);
          await this.notificationService.sentPushNotification(notificationDto);

          await this.notificationModel.create({
            userId: userId.toString(),
            title: "Interview Cancelled",
            body: "Your interview booking has been cancelled.",
            viewed: 'UNREAD'
          })
        } catch (error) {
          if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
            console.log(`Skipping invalid device token for user ${userId}: ${deviceToken}`);
            await this.UsersModel.updateOne(
              { _id: userId },
              { $set: { deviceToken: "" } }
            );
          } else {
            console.error(`Error sending notification to user ${userId}:`, error);
          }
        }
      }
    }
    return cancelResult;
  }

  async saveInterviewerLeave(holidayDto: HolidayDto, interviewerId: string) {
    const datetimes = holidayDto.datetimes;
    const leavesPayload: any[] = [];
    const availabilityOverlap: any[] = [];
    let availabilityExistCount: number = 0;

    for (let i = 0; i < datetimes.length; i++) {
      const availabilityExist = await this.getAvailabilityOf(datetimes[i].startDateTime, datetimes[i].endDateTime, interviewerId)

      if (availabilityExist.length) {
        availabilityExistCount += 1;
        availabilityOverlap.push({
          startDateTime: datetimes[i].startDateTime,
          endDateTime: datetimes[i].endDateTime,
        });
      } else {
        leavesPayload.push({
          scheduleName: holidayDto.scheduleName,
          frequency: 'NONE',
          slotDuration: 0,
          startDateTime: datetimes[i].startDateTime,
          endDateTime: datetimes[i].endDateTime,
          description: holidayDto.description,
          interviewer: interviewerId,
          type: 'LEAVE',
          status: 'ACTIVE'
        });
      }
    }
    if (leavesPayload && leavesPayload.length) {
      await this.interviewerAvailabilityModel.create(leavesPayload);
      if (availabilityExistCount === 0) {
        return { status: "success", code: "4252" }
      }
      return { status: "success", code: "5038" }
    }
    return { status: "error", code: "5043", data: { availabilityOverlap } }
  }

  async saveHoliday(holidayDto: HolidayDto, adminId: string) {
    const datetimes = holidayDto.datetimes;
    const holidaysPayload: any[] = [];
    let holidayExistCount: number = 0;

    for (let i = 0; i < datetimes.length; i++) {
      const holidayExist = await this.interviewerAvailabilityModel.find({
        type: 'HOLIDAY',
        status: 'ACTIVE',
        startDateTime: {
          $gte: moment.utc(datetimes[i].startDateTime).startOf('day'),
          $lte: moment.utc(datetimes[i].endDateTime).endOf('day')
        }
      });
      if (holidayExist.length) {
        holidayExistCount += 1;
      } else {
        holidaysPayload.push({
          scheduleName: holidayDto.scheduleName,
          frequency: 'NONE',
          slotDuration: 0,
          startDateTime: datetimes[i].startDateTime,
          endDateTime: datetimes[i].endDateTime,
          description: holidayDto.description,
          admin: adminId,
          type: 'HOLIDAY',
          status: 'ACTIVE'
        });
      }
    }

    if (holidayExistCount > 0) {
      return {
        status: 'error',
        code: '5026'
      }
    }

    await this.interviewerAvailabilityModel.create(holidaysPayload);

    return {
      status: 'success',
      code: '4221'
    }
  }

  async hardDeleteAvailabilityById(id: string) {
    return await this.interviewerAvailabilityModel.findByIdAndDelete(id);
  }

  async getBookingCountsForInterviewer(id: string, role: string) {
    const ObjectId = mongoose.Types.ObjectId;

    if (role === 'INTERVIEWER') {
      const interviewerId = new ObjectId(id);
      const interviewerAvailabilities = await this.interviewerAvailabilityModel.find({ interviewer: interviewerId }).exec();
      if (interviewerAvailabilities.length > 0) {
        const availabilityIds = interviewerAvailabilities.map(avail => avail._id);
        const bookings = await this.userBookingsModel.aggregate([
          {
            $match: {
              availabilityId: { $in: availabilityIds },
              status: { $in: ['PENDING', 'ACCEPTED', 'RESCHEDULED', 'COMPLETED'] }
            }
          }
        ]);
        return {
          totalBookings: bookings.length,
          acceptedBookings: bookings.filter(i => i.status === 'ACCEPTED').length,
          pendingBookings: bookings.filter(i => i.status === 'PENDING').length,
          rescheduledBookings: bookings.filter(i => i.status === 'RESCHEDULED').length,
          completedBookings: bookings.filter(i => i.status === 'COMPLETED').length
        };
      }
    }

    const bookings = await this.userBookingsModel.aggregate([
      {
        $lookup: {
          from: 'intervieweravailabilities',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availability'
        }
      },
      { $unwind: '$availability' },
      {
        $group: {
          _id: '$availability.interviewer',
          totalBookings: { $sum: 1 },
          acceptedBookings: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          rescheduledBookings: { $sum: { $cond: [{ $eq: ['$status', 'RESCHEDULED'] }, 1, 0] } },
          completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } }
        }
      }
    ]);

    const totalSum = bookings.reduce((acc, booking) => {
      acc.totalBookings += booking.totalBookings;
      acc.acceptedBookings += booking.acceptedBookings;
      acc.pendingBookings += booking.pendingBookings;
      acc.rescheduledBookings += booking.rescheduledBookings;
      acc.completedBookings += booking.completedBookings;
      return acc;
    }, {
      totalBookings: 0,
      acceptedBookings: 0,
      pendingBookings: 0,
      rescheduledBookings: 0,
      completedBookings: 0
    });
    return totalSum;
  }

  async getfrequencyIdData(id: string) {
    try {
      return await this.interviewerAvailabilityModel
        .find({ frequencyId: id })
        .populate('interviewer', "firstName lastName email mobileNumber")
    } catch (error) {
      throw error
    }
  }


  async checkDateOverlap(startDate, endDate, holidays, leaves) {
    const startDates = moment.utc(startDate).startOf('day');
    const endDates = moment.utc(endDate).endOf('day');

    const hasOverlap = (dates) => {
      return dates.some(date => {
        const dateStart = moment.utc(date.startDateTime).startOf('day');
        const dateEnd = moment.utc(date.endDateTime).endOf('day');

        return (
          (startDates.isSameOrAfter(dateStart) && startDates.isBefore(dateEnd)) ||
          (endDates.isAfter(dateStart) && endDates.isSameOrBefore(dateEnd)) ||
          (startDates.isSameOrBefore(dateStart) && endDates.isSameOrAfter(dateEnd))
        );
      });
    };

    // Check overlap with holidays
    const holidayOverlap = hasOverlap(holidays);

    // Check overlap with leaves
    const leaveOverlap = hasOverlap(leaves);

    return { holidayOverlap, leaveOverlap };
  }


  async checkArrayDateOverlap(datetimes: any[], holidays: any[], isExistLeave: any[], isAvailabilities: any[]) {
    const checkOverlap = (startDates, endDates, ranges) =>
      ranges.some(({ startDateTime, endDateTime }) => {
        const rangeStart = moment.utc(startDateTime).startOf('day');
        const rangeEnd = moment.utc(endDateTime).endOf('day');

        return (
          (startDates.isSameOrAfter(rangeStart) && startDates.isBefore(rangeEnd)) ||
          (endDates.isAfter(rangeStart) && endDates.isSameOrBefore(rangeEnd)) ||
          (startDates.isSameOrBefore(rangeStart) && endDates.isSameOrAfter(rangeEnd))
        );
      });

    let overlapWithHoliday = false;
    let overlapWithLeave = false;
    let overlapWithAvailability = false;

    for (const { startDateTime, endDateTime } of datetimes) {
      const startDates = moment.utc(startDateTime).startOf('day');
      const endDates = moment.utc(endDateTime).endOf('day');

      if (checkOverlap(startDates, endDates, holidays)) {
        overlapWithHoliday = true;
      }

      if (checkOverlap(startDates, endDates, isExistLeave)) {
        overlapWithLeave = true;
      }
      if (checkOverlap(startDates, endDates, isAvailabilities)) {
        overlapWithAvailability = true;
      }
      if ((overlapWithHoliday) || (overlapWithLeave) || (overlapWithAvailability)) {
        return { overlapWithHoliday, overlapWithLeave, overlapWithAvailability };
      }
    }

    return { overlapWithHoliday, overlapWithLeave, overlapWithAvailability };
  }

  async getAllLeaveAvailabilities() {
    const match = [
      { status: { $ne: 'DELETED' } },
      { type: 'LEAVE' },
    ]
    return await this.getAvailabilities(match);
  }

  async getAllAvailabilitiesInterviews() {
    const match = [
      { status: { $ne: 'DELETED' } },
      { type: 'AVAILABILITY' },
    ]
    return await this.getAvailabilities(match);
  }


  async findGemsByName(name: string) {
    return await this.gemsModel.findOne({ name: name, status: { $ne: 'DELETED' } });
  }

  async findUserById(id: string) {
    return await this.UsersModel.findOne({ _id: id, status: { $ne: 'DELETED' } });
  }

  async saveUserReview(reviewDto: ReviewDto, userId: string) {
    try {
      const reviewData = { ...reviewDto, userId };
      const createdReview = new this.interviewRatingModel(reviewData);
      const data = await createdReview.save();
      return data
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error(`${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkUnitUnlockExpiry() {
    const now = moment.utc().toDate();
    const expiredAvailability = await this.userBookingsModel.find({
      endDateTime: { $lt: now },
      status: 'PENDING'
    });

    if (expiredAvailability.length > 0) {
      await this.userBookingsModel.updateMany(
        { endDateTime: { $lt: now }, status: 'PENDING' },
        { $set: { status: 'MISSED' } }
      );
    }
  }

}
