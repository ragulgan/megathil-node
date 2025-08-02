import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
const mongoose = require('mongoose');
import { User } from '../users/users.schema';
import * as _ from 'lodash';
import * as moment from 'moment';
import { College } from 'src/college/college.schema';
import { GemsCount } from '../gems/gemsTotal.schema';
import { Transaction } from 'src/transaction/transactions.schema';
import { UserActivity } from 'src/users/usersActivites.schema';
import { Interviewer } from 'src/interviewer/interviewer.schema';
import { Staff } from '../staff/staff.schema';
import { UserProgressStatus } from '../users/userProgressStatus.schema';
const Razorpay = require('razorpay');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private UsersModel: Model<User>,
    @InjectModel(GemsCount.name) private gemsCountModel: Model<GemsCount>,
    @InjectModel(College.name) private collegeModel: Model<College>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>,
    @InjectModel(Interviewer.name) private interviewerModel: Model<Interviewer>,
    @InjectModel(Staff.name) private StaffModel: Model<Staff>,
    @InjectModel(UserProgressStatus.name) private userProgressModel: Model<UserProgressStatus>,
  ) { }

  async getUserStatistics(queryParams: any) {
    const totalUsers = await this.UsersModel.countDocuments({ status: { $ne: 'DELETED' }});
    const activeUsers = await this.UsersModel.countDocuments({ status: 'ACTIVE' });
    const inactiveUsers = await this.UsersModel.countDocuments({ status: 'INACTIVE' });
    const collegeCount = await this.collegeModel.countDocuments();
    const interviewerCount = await this.interviewerModel.countDocuments({ status: 'ACTIVE' });

    let gemPurchase: any = { series: [{ data: [] }], xaxis: { categories: [] } };
    let studentEngagement: any = {series: [{ data: [] }], xaxis: { categories: [] }};
    let unitUsage: any = { series: [], label: [] };
    let collegeUsage: any = [];

    // Monthly take
      const now = moment.utc();
      const startOfYear = now.clone().startOf('year');
      const endOfMonth = now.clone().endOf('month');

      const monthsArray = [];
      let currentMonth = moment(startOfYear);

      while (currentMonth.isBefore(endOfMonth)) {
        monthsArray.push(currentMonth.format('MMM'));
        currentMonth.add(1, 'month');
      }

      // Weekly take
      const startOfMonthWeek = now.clone().startOf('month').startOf('week');
      const endOfMonthWeek = now.clone().endOf('month').endOf('week');
      const firstWeekOfMonth = startOfMonthWeek.week();
      const lastWeekOfMonth = endOfMonthWeek.week();

      // Generate forward week labels (Week 1, Week 2, ...Week5)
      const weeksArray = [];
      for (let i = firstWeekOfMonth; i <= lastWeekOfMonth; i++) {
        weeksArray.push(`Week ${i - firstWeekOfMonth + 1}`);
      }

      // Daily take
      const startOfWeek = now.clone().startOf('week');
      const endOfWeek = now.clone().endOf('week');
      const daysArray = [];
      for (let i = 0; i < 7; i++) {
        daysArray.push(startOfWeek.clone().add(i, 'days').format('dddd'));
      }

      const startDate = queryParams.startDate ? moment.utc(queryParams.startDate, 'YYYY-MM-DD').startOf('day') : null;
      const endDate = queryParams.endDate ? moment.utc(queryParams.endDate, 'YYYY-MM-DD').endOf('day') : null;

    const getGemData = async (queryParams:any ,start: any, end: any, groupBy: any, array: any) => {
      const gemData = await this.transactionModel.aggregate([
        {
          $match: {
            $and: [
              { status: 'SUCCESS' },
              { refNumber: { $ne: null } },
              { refNumber: { $ne: '' } },
              { payment: { $ne: null } },
              { payment: { $ne: '' } },
              {
                createdAt: {
                  $gte: start.toDate(),
                  $lte: end.toDate()
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: groupBy,
            count: { $sum: "$quantity" }
          }
        },
        {
          $project: {
            _id: 0,
            name: array ? { $arrayElemAt: [array, { $subtract: ["$_id", 1] }] } : queryParams.startDate && queryParams.endDate 
                            ? { $dateToString: { format: "%Y-%m-%d", date: "$_id" } } : { $concat: ["Week ", { $toString: { $subtract: ["$_id", firstWeekOfMonth - 1] } }] },
            count: 1
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
    
      return gemData;
    };

      if (queryParams.startDate && queryParams.endDate) {
        const gemDataCustom = await getGemData(queryParams, startDate, endDate, "$createdAt", null);
        const dailyCategories = [];
        const dailyDataMap = {};
        gemDataCustom.forEach(item => {
          if (dailyDataMap[item.name]) {
            dailyDataMap[item.name] += item.count;
          } else {
            dailyDataMap[item.name] = item.count;
          }
        });
        // Populate categories and data for each day in the range
        let currentDate = startDate.clone();
        while (currentDate.isSameOrBefore(endDate)) {
          const dateString = currentDate.format("YYYY-MM-DD");
          dailyCategories.push(dateString);
          gemPurchase.series[0].data.push(dailyDataMap[dateString] || 0); // Default to 0 if no data
          currentDate.add(1, 'days');
        }
        gemPurchase.xaxis.categories = dailyCategories;
      } else {
        switch (queryParams.gemPurchase) {
          case 'MONTHLY':
            const gemDataYearly = await getGemData(queryParams, startOfYear, endOfMonth, { $month: "$createdAt" }, monthsArray);
            gemPurchase.series[0].data = monthsArray.map((month) => {
              const monthData = gemDataYearly.find((data: any) => data.name === month);
              return monthData ? monthData.count : 0;
            });
            gemPurchase.xaxis.categories = monthsArray;
            break;
          case 'WEEKLY':
            const gemDataMonthly = await getGemData(queryParams, startOfMonthWeek, endOfMonthWeek, { $week: "$createdAt" }, null);
            gemPurchase.series[0].data = weeksArray.map((week) => {
              const weekData = gemDataMonthly.find((data: any) => data.name === week);
              return weekData ? weekData.count : 0;
            });
            gemPurchase.xaxis.categories = weeksArray;
            break;
          case 'DAILY':
            const gemDataWeekly = await getGemData(queryParams, startOfWeek, endOfWeek, { $dayOfWeek: "$createdAt" }, daysArray);
            gemPurchase.series[0].data = daysArray.map((day) => {
              const dayData = gemDataWeekly.find((data: any) => data.name === day);
              return dayData ? dayData.count : 0;
            });
            gemPurchase.xaxis.categories = daysArray;
            break;
          default:
            gemPurchase = { series: [{ data: [] }], xaxis: { categories: [] } };
        }
      }
    
      const studentEngagementStartDate = queryParams.studentEngagementStartDate ? moment.utc(queryParams.studentEngagementStartDate, 'YYYY-MM-DD').startOf('day') : null;
      const studentEngagementEndDate = queryParams.studentEngagementEndDate ? moment.utc(queryParams.studentEngagementEndDate, 'YYYY-MM-DD').endOf('day') : null;
      
    const getEngagementData = async (queryParams: any, start: any, end: any, groupBy: any, array: any) => {
      const engagementData = await this.userProgressModel.aggregate([
        {
          $match: {
            $and: [
              { userId: { "$exists": true } },
              { unitId: { "$exists": true } },
              { moduleId: { "$exists": true } },
              {
                createdAt: {
                  $gte: start.toDate(),
                  $lte: end.toDate()
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        {
          $unwind: "$userDetails"
        },
        {
          $match: {
            "userDetails.status": "ACTIVE"
          }
        },
        {
          $group: {
            _id: {
              groupBy: groupBy,
              userId: "$userDetails._id"
            }
          }
        },
        {
          $group: {
            _id: "$_id.groupBy",
            uniqueUserIds: { $addToSet: "$_id.userId" }
          }
        },
        {
          $project: {
            _id: 0,
            name: array ? { $arrayElemAt: [array, { $subtract: ["$_id", 1] }] } : queryParams.studentEngagementStartDate && queryParams.studentEngagementEndDate
                            ? "$_id" : { $concat: ["Week ", { $toString: { $subtract: ["$_id", firstWeekOfMonth - 1] } }] },
            count: { $size: "$uniqueUserIds" }
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
    
      return engagementData;
    };
    
    if (queryParams.studentEngagementStartDate && queryParams.studentEngagementEndDate) {
      const engagementDataCustom = await getEngagementData(queryParams, studentEngagementStartDate, studentEngagementEndDate, { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, null);
      const dailyCategories = [];
      const dailyDataMap = {};
      engagementDataCustom.forEach(item => {
        dailyDataMap[item.name] = (dailyDataMap[item.name] ?? 0) + item.count;
      });
      // Populate categories and data for each day in the range
      let currentDate = studentEngagementStartDate.clone();
      while (currentDate.isSameOrBefore(studentEngagementEndDate)) {
        const dateString = currentDate.format("YYYY-MM-DD");
        dailyCategories.push(dateString);
        studentEngagement.series[0].data.push(dailyDataMap[dateString] || 0); // Default to 0 if no data
        currentDate.add(1, 'days');
      }
      studentEngagement.xaxis.categories = dailyCategories;
    } else {
      switch (queryParams.studentEngagement) {
        case 'MONTHLY':
          const engagementDataYearly = await getEngagementData(queryParams, startOfYear, endOfMonth, { $month: "$createdAt" }, monthsArray);
          studentEngagement.series[0].data = monthsArray.map((month) => {
            const monthData = engagementDataYearly.find((data: any) => data.name === month);
            return monthData ? monthData.count : 0;
          });
          studentEngagement.xaxis.categories = monthsArray;
          break;
        case 'WEEKLY':
          const engagementDataMonthly = await getEngagementData(queryParams, startOfMonthWeek, endOfMonthWeek, { $week: "$createdAt" }, null);
          studentEngagement.series[0].data = weeksArray.map((week) => {
            const weekData = engagementDataMonthly.find((data: any) => data.name === week);
            return weekData ? weekData.count : 0;
          });
          studentEngagement.xaxis.categories = weeksArray;
          break;
        case 'DAILY':
          const engagementDataWeekly = await getEngagementData(queryParams, startOfWeek, endOfWeek, { $dayOfWeek: "$createdAt" }, daysArray);
          studentEngagement.series[0].data = daysArray.map((day) => {
            const dayData = engagementDataWeekly.find((data: any) => data.name === day);
            return dayData ? dayData.count : 0;
          });
          studentEngagement.xaxis.categories = daysArray;
          break;
        default:
          studentEngagement = { series: [{ data: [] }], xaxis: { categories: [] } };
      }
    }

    const unitUsageData = await this.userProgressModel.aggregate([
      {
        $match: {
          $and: [
            { userId: { "$exists": true } },
            { unitId: { "$exists": true } },
            { moduleId: { "$exists": true } },
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.status": "ACTIVE"
        }
      },
      {
        $group: {
          _id: {
            userId: "$userDetails._id",
            unitId: "$unitId"
          }
        }
      },
      {
        $group: {
          _id: "$_id.unitId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "units",
          localField: "_id",
          foreignField: "_id",
          as: "unitDetails"
        }
      },
      {
        $unwind: "$unitDetails"
      },
      {
        $match: {
          "unitDetails.status": "ACTIVE"
        }
      },
      {
        $project: {
          _id: 0,
          displayOrder: { $toInt: "$unitDetails.displayOrder" },
          count: 1
        }
      },
      {
        $sort: { displayOrder: 1 }
      }
    ]);

    unitUsage.series = unitUsageData.map((data: any) => data.count);
    unitUsage.label = unitUsageData.map((data: any, index: number) => `Unit ${String(index + 1).padStart(2, '0')}`);

    const collegeUsageStartDate = queryParams.collegeUsageStartDate ? moment.utc(queryParams.collegeUsageStartDate, 'YYYY-MM-DD').startOf('day') : null;
    const collegeUsageEndDate = queryParams.collegeUsageEndDate ? moment.utc(queryParams.collegeUsageEndDate, 'YYYY-MM-DD').endOf('day') : null;

    const getCollegeUsageData = async (queryParams: any, start: any, end: any) => {
      const collegeUsageData = await this.userProgressModel.aggregate([
        {
          $match: {
            $and: [
              { userId: { "$exists": true } },
              { unitId: { "$exists": true } },
              { moduleId: { "$exists": true } },
              {
                createdAt: {
                  $gte: start.toDate(),
                  $lte: end.toDate()
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: '$userId',
            activityCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userData'
          }
        },
        { $unwind: '$userData' },
        {
          $match: {
            'userData.college': { $exists: true },
            'userData.status': "ACTIVE"
          }
        },
        {
          $group: {
            _id: '$userData.college',
            userCount: { $sum: 1 }
          }
        },
        { $sort: { userCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'colleges',
            localField: '_id',
            foreignField: '_id',
            as: 'collegeData'
          }
        },
        { $unwind: '$collegeData' },
        {
          $match: {
            'collegeData.status': "ACTIVE"
          }
        },
        {
          $project: {
            _id: 0,
            collegeId: '$_id',
            userCount: 1,
            collegeName: '$collegeData.name',
            shortDescription: '$collegeData.shortDescription',
            collegeLogo: '$collegeData.collegeLogo'
          }
        }
      ]);
    
      return collegeUsageData;
    };
    if(queryParams.collegeUsageStartDate && queryParams.collegeUsageEndDate){
      collegeUsage = await getCollegeUsageData(queryParams, collegeUsageStartDate, collegeUsageEndDate);
    }
    else {
    switch (queryParams.collegeUsage) {
      case 'MONTHLY':
        collegeUsage = await getCollegeUsageData(queryParams, startOfYear, endOfMonth);
        break;
      case 'WEEKLY':
        collegeUsage = await getCollegeUsageData(queryParams, startOfMonthWeek, endOfMonthWeek);
        break;
      case 'DAILY':
        collegeUsage = await getCollegeUsageData(queryParams, startOfWeek, endOfWeek);
        break;
      default:
        collegeUsage = [];
    }
  }
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      collegeCount,
      interviewerCount,
      gemPurchase,
      studentEngagement,
      unitUsage,
      collegeUsage
    };
  }

  async getUserStatisticsStaffLogin(queryParams: any, id: any) {
    const staffDetails = await this.StaffModel.findById(id).select('college').exec();
    let college = staffDetails.college
    const userDetails = await this.UsersModel.find({college}).select('id').exec();
    const mappedIdDetails = userDetails && userDetails.map((item=> item._id))
    const totalUsers = await this.UsersModel.countDocuments({ college: staffDetails.college, status: { $ne: 'DELETED' } });
    const staffUsers = await this.UsersModel.countDocuments({ college: staffDetails.college, source: 'WEB', status: { $ne: 'DELETED' } });
    const activeUsers = await this.UsersModel.countDocuments({ college: staffDetails.college, status: 'ACTIVE', source: 'WEB' });
    const inactiveUsers = await this.UsersModel.countDocuments({ college: staffDetails.college, status: 'INACTIVE', source: 'WEB' });
    const standardUsers = await this.UsersModel.countDocuments({ college: staffDetails.college, source: 'MOBILE', status: { $ne: 'DELETED' } });
    const collegeCount = await this.collegeModel.countDocuments({_id: staffDetails.college });
    const interviewerCount = await this.interviewerModel.countDocuments({ status: 'ACTIVE' });

    let gemPurchase: any = { series: [{ data: [] }], xaxis: { categories: [] } };
    let studentEngagement: any = {series: [{ data: [] }], xaxis: { categories: [] }};
    let unitUsage: any = { series: [], label: [] };
    let collegeUsage: any = [];

    // Monthly take
      const now = moment.utc();
      const startOfYear = now.clone().startOf('year');
      const endOfMonth = now.clone().endOf('month');

      const monthsArray = [];
      let currentMonth = moment(startOfYear);

      while (currentMonth.isBefore(endOfMonth)) {
        monthsArray.push(currentMonth.format('MMM'));
        currentMonth.add(1, 'month');
      }

      // Weekly take
      const startOfMonthWeek = now.clone().startOf('month').startOf('week');
      const endOfMonthWeek = now.clone().endOf('month').endOf('week');
      const firstWeekOfMonth = startOfMonthWeek.week();
      const lastWeekOfMonth = endOfMonthWeek.week();

      // Generate forward week labels (Week 1, Week 2, ...Week5)
      const weeksArray = [];
      for (let i = firstWeekOfMonth; i <= lastWeekOfMonth; i++) {
        weeksArray.push(`Week ${i - firstWeekOfMonth + 1}`);
      }

      // Daily take
      const startOfWeek = now.clone().startOf('week');
      const endOfWeek = now.clone().endOf('week');
      const daysArray = [];
      for (let i = 0; i < 7; i++) {
        daysArray.push(startOfWeek.clone().add(i, 'days').format('dddd'));
      }
    const getGemData = async (queryParams, start: any, end: any, groupBy: any, array: any, userIds: any[]) => {
      const objectIdUserIds = userIds.map((id) => new ObjectId(id));
      const gemData = await this.transactionModel.aggregate([
        {
          $match: {
            $and: [
              { userId: { "$in": objectIdUserIds } },
              { status: 'SUCCESS' },
              { refNumber: { $ne: null } },
              { refNumber: { $ne: '' } },
              { payment: { $ne: null } },
              { payment: { $ne: '' } },
              {
                createdAt: {
                  $gte: start.toDate(),
                  $lte: end.toDate()
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: groupBy,
            count: { $sum: "$quantity" }
          }
        },
        {
          $project: {
            _id: 0,
            name: array ? { $arrayElemAt: [array, { $subtract: ["$_id", 1] }] } : { $concat: ["Week ", { $toString: { $subtract: ["$_id", firstWeekOfMonth - 1] } }] },
            count: 1
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
    
      return gemData;
    };

    switch (queryParams.gemPurchase) {
      case 'MONTHLY':
        const gemDataYearly = await getGemData(queryParams, startOfYear, endOfMonth, { $month: "$createdAt" }, monthsArray, mappedIdDetails);
        gemPurchase.series[0].data = monthsArray.map((month) => {
          const monthData = gemDataYearly.find((data: any) => data.name === month);
          return monthData ? monthData.count : 0;
        });
        gemPurchase.xaxis.categories = monthsArray;
        break;
      case 'WEEKLY':
        const gemDataMonthly = await getGemData(queryParams, startOfMonthWeek, endOfMonthWeek, { $week: "$createdAt" }, null, mappedIdDetails);
        gemPurchase.series[0].data = weeksArray.map((week) => {
          const weekData = gemDataMonthly.find((data: any) => data.name === week);
          return weekData ? weekData.count : 0;
        });
        gemPurchase.xaxis.categories = weeksArray;
        break;
      case 'DAILY':
        const gemDataWeekly = await getGemData(queryParams, startOfWeek, endOfWeek, { $dayOfWeek: "$createdAt" }, daysArray, mappedIdDetails);
        gemPurchase.series[0].data = daysArray.map((day) => {
          const dayData = gemDataWeekly.find((data: any) => data.name === day);
          return dayData ? dayData.count : 0;
        });
        gemPurchase.xaxis.categories = daysArray;
        break;
      default:
        gemPurchase = { series: [{ data: [] }], xaxis: { categories: [] } };
    }

    const studentEngagementStartDate = queryParams.studentEngagementStartDate ? moment.utc(queryParams.studentEngagementStartDate, 'YYYY-MM-DD').startOf('day') : null;
    const studentEngagementEndDate = queryParams.studentEngagementEndDate ? moment.utc(queryParams.studentEngagementEndDate, 'YYYY-MM-DD').endOf('day') : null;

    const getEngagementData = async (queryParams: any, start: any, end: any, groupBy: any, array: any, userIds: any[]) => {
      const objectIdUserIds = userIds.map((id) => new ObjectId(id));
      const engagementData = await this.userProgressModel.aggregate([
        {
          $match: {
            $and: [
              { userId: { "$in": objectIdUserIds } },
              { unitId: { "$exists": true } },
              { moduleId: { "$exists": true } },
              {
                createdAt: {
                  $gte: start.toDate(),
                  $lte: end.toDate()
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        {
          $unwind: "$userDetails"
        },
        {
          $match: {
            "userDetails.status": "ACTIVE"
          }
        },
        {
          $group: {
            _id: {
              groupBy: groupBy,
              userId: "$userDetails._id"
            }
          }
        },
        {
          $group: {
            _id: "$_id.groupBy",
            uniqueUserIds: { $addToSet: "$_id.userId" }
          }
        },
        {
          $project: {
            _id: 0,
            name: array ? { $arrayElemAt: [array, { $subtract: ["$_id", 1] }] } : queryParams.studentEngagementStartDate && queryParams.studentEngagementEndDate
                        ? "$_id" : { $concat: ["Week ", { $toString: { $subtract: ["$_id", firstWeekOfMonth - 1] } }] },
            count: { $size: "$uniqueUserIds" }
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
    
      return engagementData;
    };
    
    if (queryParams.studentEngagementStartDate && queryParams.studentEngagementEndDate) {
      const engagementDataCustom = await getEngagementData(queryParams, studentEngagementStartDate, studentEngagementEndDate, { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, null, mappedIdDetails);
      const dailyCategories = [];
      const dailyDataMap = {};
      engagementDataCustom.forEach(item => {
        dailyDataMap[item.name] = (dailyDataMap[item.name] ?? 0) + item.count;
      });
      // Populate categories and data for each day in the range
      let currentDate = studentEngagementStartDate.clone();
      while (currentDate.isSameOrBefore(studentEngagementEndDate)) {
        const dateString = currentDate.format("YYYY-MM-DD");
        dailyCategories.push(dateString);
        studentEngagement.series[0].data.push(dailyDataMap[dateString] || 0); // Default to 0 if no data
        currentDate.add(1, 'days');
      }
      studentEngagement.xaxis.categories = dailyCategories;
    } else {
      switch (queryParams.studentEngagement) {
        case 'MONTHLY':
          const engagementDataYearly = await getEngagementData(queryParams, startOfYear, endOfMonth, { $month: "$createdAt" }, monthsArray, mappedIdDetails);
          studentEngagement.series[0].data = monthsArray.map((month) => {
            const monthData = engagementDataYearly.find((data: any) => data.name === month);
            return monthData ? monthData.count : 0;
          });
          studentEngagement.xaxis.categories = monthsArray;
          break;
        case 'WEEKLY':
          const engagementDataMonthly = await getEngagementData(queryParams, startOfMonthWeek, endOfMonthWeek, { $week: "$createdAt" }, null, mappedIdDetails);
          studentEngagement.series[0].data = weeksArray.map((week) => {
            const weekData = engagementDataMonthly.find((data: any) => data.name === week);
            return weekData ? weekData.count : 0;
          });
          studentEngagement.xaxis.categories = weeksArray;
          break;
        case 'DAILY':
          const engagementDataWeekly = await getEngagementData(queryParams, startOfWeek, endOfWeek, { $dayOfWeek: "$createdAt" }, daysArray, mappedIdDetails);
          studentEngagement.series[0].data = daysArray.map((day) => {
            const dayData = engagementDataWeekly.find((data: any) => data.name === day);
            return dayData ? dayData.count : 0;
          });
          studentEngagement.xaxis.categories = daysArray;
          break;
        default:
          studentEngagement = { series: [{ data: [] }], xaxis: { categories: [] } };
      }
    }
    const objectIdUserIds = mappedIdDetails.map((id) => new ObjectId(id));
    const unitUsageData = await this.userProgressModel.aggregate([
      {
        $match: {
          $and: [
            { userId: { "$in": objectIdUserIds } },
            { unitId: { "$exists": true } },
            { moduleId: { "$exists": true } },
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $match: {
          "userDetails.status": "ACTIVE"
        }
      },
      {
        $group: {
          _id: {
            userId: "$userDetails._id",
            unitId: "$unitId"
          }
        }
      },
      {
        $group: {
          _id: "$_id.unitId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "units",
          localField: "_id",
          foreignField: "_id",
          as: "unitDetails"
        }
      },
      {
        $unwind: "$unitDetails"
      },
      {
        $match: {
          "unitDetails.status": "ACTIVE"
        }
      },
      {
        $project: {
          _id: 0,
          displayOrder: { $toInt: "$unitDetails.displayOrder" },
          count: 1
        }
      },
      {
        $sort: { displayOrder: 1 }
      }
    ]);

    unitUsage.series = unitUsageData.map((data: any) => data.count);
    unitUsage.label = unitUsageData.map((data: any, index: number) => `Unit ${String(index + 1).padStart(2, '0')}`);

    const getCollegeUsageData = async (queryParams: any, start: any, end: any, userIds: any[]) => {
      const objectIdUserIds = userIds.map((id) => new ObjectId(id));
      const collegeUsageData = await this.userProgressModel.aggregate([
        {
          $match: {
            $and: [
              { userId: { "$in": objectIdUserIds } },
              { unitId: { "$exists": true } },
              { moduleId: { "$exists": true } },
              {
                createdAt: {
                  $gte: start.toDate(),
                  $lte: end.toDate()
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: '$userId',
            activityCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userData'
          }
        },
        { $unwind: '$userData' },
        {
          $match: {
            'userData.college': { $exists: true },
            'userData.status': "ACTIVE"
          }
        },
        {
          $group: {
            _id: '$userData.college',
            userCount: { $sum: 1 }
          }
        },
        { $sort: { userCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'colleges',
            localField: '_id',
            foreignField: '_id',
            as: 'collegeData'
          }
        },
        { $unwind: '$collegeData' },
        {
          $match: {
            'collegeData.status': "ACTIVE"
          }
        },
        {
          $project: {
            _id: 0,
            collegeId: '$_id',
            userCount: 1,
            collegeName: '$collegeData.name',
            shortDescription: '$collegeData.shortDescription',
            collegeLogo: '$collegeData.collegeLogo'
          }
        }
      ]);
  
      return collegeUsageData;
    };
    
    switch (queryParams.collegeUsage) {
      case 'MONTHLY':
        collegeUsage = await getCollegeUsageData(queryParams, startOfYear, endOfMonth, mappedIdDetails);
        break;
      case 'WEEKLY':
        collegeUsage = await getCollegeUsageData(queryParams, startOfMonthWeek, endOfMonthWeek, mappedIdDetails);
        break;
      case 'DAILY':
        collegeUsage = await getCollegeUsageData(queryParams, startOfWeek, endOfWeek, mappedIdDetails);
        break;
      default:
        collegeUsage = [];
    }
    return {
      totalUsers,
      staffUsers,
      activeUsers,
      inactiveUsers,
      standardUsers,
      collegeCount,
      interviewerCount,
      gemPurchase,
      studentEngagement,
      unitUsage,
      collegeUsage
    };
  }

  async getGemsStatistics() {
    const now = moment.utc();
    const startOfYear = now.clone().startOf('year').toDate();
    const endOfYear = now.clone().endOf('year').toDate();
    const startOfFourWeeksAgo = now.clone().subtract(3, 'weeks').startOf('week').toDate();
    const endOfWeeks = now.clone().startOf('week').toDate();
    const startOfWeek = now.clone().startOf('week').toDate();
    const endOfWeek = now.clone().endOf('week').toDate();
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.clone().endOf('day').toDate();
  
    const gemsStatistics = await this.gemsCountModel.aggregate([
      {
        $facet: {
          yearly: [
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                totalGemValue: { $sum: "$gemValue" }
              }
            },
            { $sort: { "_id": 1 } }
          ],
          monthly: [
            { $match: { createdAt: { $gte: startOfFourWeeksAgo, $lte: endOfWeeks } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
                totalGemValue: { $sum: "$gemValue" }
              }
            },
            { $sort: { "_id": 1 } },
            { $limit: 4 }
          ],
          weekly: [
            { $match: { createdAt: { $gte: startOfWeek, $lte: endOfWeek } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalGemValue: { $sum: "$gemValue" }
              }
            },
            { $sort: { "_id": 1 } }
          ],
          daily: [
            { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d %H", date: "$createdAt" } },
                totalGemValue: { $sum: "$gemValue" }
              }
            },
            { $sort: { "_id": 1 } }
          ]
        }
      }
    ]).exec();
    return {
      yearlyGems: gemsStatistics[0].yearly,
      monthlyGems: gemsStatistics[0].monthly,
      weeklyGems: gemsStatistics[0].weekly,
      dailyGems: gemsStatistics[0].daily
    };
  }
  

}
