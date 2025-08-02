import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MediaLibrary } from './mediaLibrary.schema';
import { MediaLikes } from './mediaLikes.schema';
import { CreateMediaLibraryDto } from './dto/createMediaLibrary.dto';
import { UpdatedMediaLibraryDto } from './dto/updateMediaLibrary.dto';
import { CreateMediaLikesDto } from './dto/createMediaLikes.dto';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.schema';
import { User } from 'src/users/users.schema';
const mongoose = require('mongoose');
import * as _ from 'lodash';

@Injectable()
export class MediaLibraryService {
  constructor(
    @InjectModel(MediaLibrary.name) private MediaLibraryModel: Model<MediaLibrary>,
    @InjectModel(MediaLikes.name) private MediaLikesModel: Model<MediaLikes>,
    @InjectModel(User.name) private UsersModel: Model<User>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly notificationService: NotificationService,

  ) { }

  async create(createMediaLibraryDto: CreateMediaLibraryDto): Promise<MediaLibrary> {
    try {
      const createdMediaLibrary = new this.MediaLibraryModel(createMediaLibraryDto);
      const saveMediaLibrary = await createdMediaLibrary.save();
      if (createMediaLibraryDto.libraryStatus === 'PUBLISH') {
        const usersWithDeviceToken = await this.UsersModel.find({
          $and: [
            { deviceToken: { $exists: true } },
            { deviceToken: { $ne: null } },
            { deviceToken: { $ne: "" } }
          ]
        }, 'deviceToken _id').exec();
  
        if (usersWithDeviceToken && usersWithDeviceToken.length > 0) {
          const title = 'New Media Library Published';
          const body = `A new media entry titled "${createMediaLibraryDto.title}" has been published.`;
  
          for (const user of usersWithDeviceToken) {
            try {
              const notificationDto = this.notificationService.createNotificationDto(title, body, user.deviceToken);
              await this.notificationService.sentPushNotification(notificationDto);

              // Save notification
              // await this.notificationModel.create({
              //   userId: user._id.toString(),
              //   title: "Interview Accepted",
              //   body: "Your interview booking has been accepted.",
              //   viewed: 'UNREAD'
              // });
            } catch (error) {
              if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
                console.log(`Skipping invalid token for user ${user._id}: ${user.deviceToken}`);
                await this.UsersModel.updateOne(
                  { _id: user._id },
                  { $set: { deviceToken: "" } }
                );
              } else {
                console.error(`Error sending notification to user ${user._id}:`, error);
              }
            }
          }
        }
      }
      return saveMediaLibrary;
    } catch (error) {
      console.error("Validation Error:", error);
      throw new Error("Validation Error occurred while saving MediaLibrary.");
    }
  }

  async findAll(queryParams: any, id: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const userId = new ObjectId(id);
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const match: any = { status: 'ACTIVE' }
    if (queryParams.title) {
      match.title = new RegExp(queryParams.title, 'i');
    }
    if (queryParams.category) {
      match.category = new RegExp(queryParams.category, 'i');
    }
    if (queryParams.libraryStatus) {
      match.libraryStatus = queryParams.libraryStatus;
    }
    if (queryParams.status) {
      match.status = queryParams.status;
    }
    const MediaLibraryList = await this.MediaLibraryModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'medialikes',
          localField: '_id',
          foreignField: 'mediaId',
          as: 'likes'
        }
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          liked: {
            $gt: [
              { $size: { $filter: { input: '$likes', as: 'like', cond: { $eq: ['$$like.userId', userId] } } } },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          title: 1,
          description: 1,
          url: 1,
          titleImage: 1,
          category: 1,
          summary: 1,
          type: 1,
          libraryStatus: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          liked: 1
        }
      }
    ]).exec();
    const count = await this.MediaLibraryModel.countDocuments(match).exec()
    return { MediaLibraryList, count };
  }

  async findByEmail(email: string): Promise<MediaLibrary | null> {
    const MediaLibrary = await this.MediaLibraryModel.findOne({ email }).exec();
    return MediaLibrary || null;
  }


  async findById(id: string): Promise<MediaLibrary> {
    return this.MediaLibraryModel.findById(id).exec();
  }


  async update(id: string, updatedMediaLibraryDto: UpdatedMediaLibraryDto): Promise<MediaLibrary> {
    try{
    const updatMediaLibrary =  await this.MediaLibraryModel.findOneAndUpdate({ _id: id }, updatedMediaLibraryDto).exec();
    if (updatedMediaLibraryDto.libraryStatus === 'PUBLISH') {
      const usersWithDeviceToken = await this.UsersModel.find({
        $and: [
          { deviceToken: { $exists: true } },
          { deviceToken: { $ne: null } },
          { deviceToken: { $ne: "" } }
        ]
      }, 'deviceToken _id').exec();

      if (usersWithDeviceToken && usersWithDeviceToken.length > 0) {
        const title = 'Media Library Published';
        const body = `A media entry titled "${updatedMediaLibraryDto.title}" has been published.`;

        for (const user of usersWithDeviceToken) {
          try {
            const notificationDto = this.notificationService.createNotificationDto(title, body, user.deviceToken);
            await this.notificationService.sentPushNotification(notificationDto);

            // Save notification
            // await this.notificationModel.create({
            //   userId: user._id.toString(),
            //   title: "Interview Accepted",
            //   body: "Your interview booking has been accepted.",
            //   viewed: 'UNREAD'
            // });
          } catch (error) {
            if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument') {
              console.log(`Skipping invalid token for user ${user._id}: ${user.deviceToken}`);
              await this.UsersModel.updateOne(
                { _id: user._id },
                { $set: { deviceToken: "" } }
              );
            } else {
              console.error(`Error sending notification to user ${user._id}:`, error);
            }
          }
        }
      }
    }
    return updatMediaLibrary
    } catch (error) {
      console.error("Update Error:", error);
      throw new Error("Error occurred while updating MediaLibrary.");
    }
  }


  async delete(id: string): Promise<MediaLibrary> {
    const updatedMediaLibrary = await this.MediaLibraryModel
      .findByIdAndUpdate(
        id,
        { $set: { status: 'DELETED' } },
        { new: true }
      )
      .lean()
      .exec();
    return updatedMediaLibrary;
  }

  async mediaLikes(mediaId: string, userId: string): Promise<any> {
    try {
      const existingLike = await this.MediaLikesModel.findOne({ userId, mediaId });
      if (existingLike) {
        await this.MediaLikesModel.deleteOne({ userId, mediaId });
        return { like: 'unlike', existingLike }
      } else {
        const newLike = new this.MediaLikesModel({ userId, mediaId });
        await newLike.save();
        return { like: 'like', newLike }
      }
    } catch (error) {
      throw error;
    }
  }



}
