import { Injectable } from '@nestjs/common';
import { NotificationDto } from './dto/notification.dto';
import { getServiceAccount } from 'src/utill/megathil-firebase-adminsdk';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './notification.schema';
import { Model } from 'mongoose';
import { UpdateNotificationDto } from './dto/notificationUpdate.dto';
const admin = require("firebase-admin");

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private NotificationModel: Model<Notification>,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(getServiceAccount()),
    });
  }

  async sentPushNotification(notificationDto: NotificationDto) {
    const messaging = admin.messaging();
    const payload = {
      notification: {
        title: notificationDto?.title,
        body: notificationDto?.body,
      },
      token: notificationDto?.deviceToken,
    };

    return messaging.send(payload);
  }

  async findAllNotification(queryParams: any) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit;
    const match: any = { viewed: 'UNREAD' };

    if (queryParams.viewed) {
      match.viewed = queryParams.viewed;
    }

    if (queryParams.title) {
      match.title = queryParams.title;
    }

    if (queryParams.userId) {
      match['userId'] = new ObjectId(queryParams.userId);
    }

    let userMatch: any = {};

    if (queryParams.firstName) {
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

      if (queryParams.firstName) {
        const splitValue = queryParams.firstName.split(' ');
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

    const NotificationList = await this.NotificationModel.aggregate([
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
        $project: {
          _id: 1,
          title: 1,
          body: 1,
          viewed: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            email: '$user.email',
            mobileNumber: '$user.mobileNumber',
            profileImage: '$user.profileImage'
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
    const countResult = await this.NotificationModel.aggregate(countPipeline).exec();
    const count = countResult.length > 0 ? countResult[0].total : 0;
    return { NotificationList, count };
  }

  async findUserNotification(queryParams: any, userId: string) {
    const limit = Number(queryParams.limit) || 10;
    const page = Number(queryParams.page) || 1;
    const skipValue = (page - 1) * limit
    const userObjectId = new ObjectId(userId);
    const match: any = {
      viewed: 'UNREAD',
      userId: userObjectId,
    };
    const NotificationList = await this.NotificationModel.find(match).select('title body viewed createdAt updatedAt').sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.NotificationModel.countDocuments(match).exec()
    return { NotificationList, count };
  }

  async updateNotification(id: string, updateNotificationDto: UpdateNotificationDto, userId: string): Promise<Notification> {
    const updateData = {
      viewed: updateNotificationDto.viewed,
      userId: userId,
      updatedAt: new Date(),
    };
    return this.NotificationModel.findOneAndUpdate({ _id: id, userId }, updateData, { new: true }).exec();
  }

  // @Cron(CronExpression.EVERY_WEEKDAY)
  // async handleCron() {
  //   const notificationDto = this.createNotificationDto();
  //   const notifationSent = await this.sentPushNotification(notificationDto);
  //   if (notifationSent) {
  //     console.log('Notification sent successfully via cron job');
  //   } else {
  //     console.error('Failed to send notification via cron job');
  //   }
  // }
  createNotificationDto(title?: string, body?: string, deviceToken?: string): NotificationDto {
    return {
      title: title || 'We Miss You on Megathil!',
      body: body || 'It looks like you haven’t logged into the app today. Don’t miss out on the latest updates!',
      deviceToken: deviceToken || 'ehtA_0D9TvOyRGXHYMWqRq:APA91bEFKsJpWiDY4ZctLVApmQdbgxhNgFTksvOn0e-kty2Xlh62b2ZQzGlbSBOlBWVPUSWRiXpqqh7JvWFXj-zh7WOnwP2iuyCIZ9Q-zYdNQqQPOBvcVJEuKn46_ncqy9ozdFY1aoUY',
    };
  }
}
