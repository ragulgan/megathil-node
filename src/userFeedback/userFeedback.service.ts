import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FeedBack } from './userFeedback.schema';
import { FeedBackDto } from './dto/userFeedBackCreate.dto';
import { UpdateFeedBackDto } from './dto/userFeedBackUpdate.dto';

@Injectable()
export class UsersFeedbackService {
    constructor(
        @InjectModel(FeedBack.name) private UsersRatingModel: Model<FeedBack>,
    ) { }

    async create(userRatingDto: FeedBackDto, userId: string): Promise<FeedBack> {
        try {
            const feedbackCount = await this.UsersRatingModel.countDocuments();
            const ticketNumber = feedbackCount + 1;
            const ticket = `#MEG${ticketNumber.toString().padStart(3, '0')}`;

            const userRatingData = {
                ...userRatingDto,
                userId,
                ticket
            }
            const createdUserRating = new this.UsersRatingModel(userRatingData);
            const data = await createdUserRating.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = {status: 'ACTIVE'}
    
    
        if (queryParams.ticket || queryParams.title) {
          const orCondition = []
          if (queryParams.ticket) {
            orCondition.push({
                ticket: new RegExp(`${queryParams.ticket}`, 'i')
            });
          }
          if (queryParams.title) {
            orCondition.push({
              title: new RegExp(`${queryParams.title}`, 'i')
            });
          }
          match = { ...match, $or: orCondition }
        }
    
        const FeedbackList = await this.UsersRatingModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit)
        .populate('userId', 'firstName lastName email mobileNumber profileImage').exec();
        const count = await this.UsersRatingModel.countDocuments(match).exec()
        return { FeedbackList, count };
      }
    
    async findById(id: string): Promise<FeedBack> {
        return this.UsersRatingModel.findById(id).populate('userId', 'firstName lastName email mobileNumber profileImage').exec();
      }
    
    async update(id: string, updateFeedbackDto: UpdateFeedBackDto, userId: string): Promise<FeedBack> {
        const updateData = {
            ...updateFeedbackDto,
            userId
        };
        return this.UsersRatingModel.findOneAndUpdate({ _id: id }, updateData).exec();
      }
    
    
    async delete(id: string): Promise<FeedBack> {
        const deletedFeedback = await this.UsersRatingModel
          .findByIdAndUpdate(
            id,
            { $set: { status: 'DELETED' } },
            { new: true }
          )
          .lean()
          .exec();
        return deletedFeedback
      }
    
}