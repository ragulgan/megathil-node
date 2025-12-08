import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubTopics } from './sub-topics.schema';
import { CreateSubTopicsDto } from './dto/createSubTopic.dto';
import { UpdateSubTopicsDto } from './dto/updateSubTopic.dto';
import * as _ from 'lodash';
import { Topics } from 'src/topics/topics.schema';
import { SubTopics1 } from 'src/sub-topics1/sub-topic1.schema';
const mongoose = require('mongoose');

@Injectable()
export class SubTopicService {
    constructor(
        @InjectModel(Topics.name) private topicModel: Model<Topics>,
        @InjectModel(SubTopics.name) private subTopicModel: Model<SubTopics>,
        @InjectModel(SubTopics1.name) private subTopic1Model: Model<SubTopics1>,
    ) { }

    async create(createSubTopicsDto: CreateSubTopicsDto): Promise<SubTopics> {
        try {
            const createdSubTopic = new this.subTopicModel(createSubTopicsDto);
            const data = await createdSubTopic.save();
            await this.subTopicModel.findOneAndUpdate({ _id: data._id }, { subTopicId: data._id }).exec();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Module.");
        }
    }

    async findMinimalBySubTopicId(queryParams: any, topicId: string, decodedToken: any) {
        const parsedPage = parseInt(String(queryParams.page), 10) || 1;
        const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
        const skipValue = (parsedPage - 1) * parsedLimit;
        const ObjectId = mongoose.Types.ObjectId;
        const topicObjectId = new ObjectId(topicId);
        const match: any = { status: 'ACTIVE', topicId: topicObjectId };
        if (queryParams.status) {
            match.status = queryParams.status;
        }
        if (!decodedToken || (decodedToken.role != 'SUPER_ADMIN' && decodedToken.role != 'ADMIN')) {
            match._id = { $in: await this.getSubTopicsWithActiveSubTopics1() };
        }
        const subTopicList = await this.subTopicModel.aggregate([
            { $match: match },
            { $skip: skipValue },
            { $limit: parsedLimit },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topicId',
                },
            },
            { $unwind: { path: '$topicId', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    subTopicId: '$_id',
                    subTopicName: 1,
                    imageUrl: 1,
                    description: 1,
                    status: 1,
                    topicId: {
                        id: '$topicId._id',
                        topicName: '$topicId.topicName',
                    },
                    displayOrder: 1,
                },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);
        const count = await this.subTopicModel.countDocuments(match).exec();
        const topic = await this.topicModel.findOne({ _id: topicId }).select("topicId topicName imageUrl status");
        return { subTopicList, count, topic }
    }

    async getSubTopicsWithActiveSubTopics1(): Promise<string[]> {
        const activeSubTopics = await this.subTopic1Model.aggregate([
            { $match: { status: "ACTIVE" } },
            { $group: { _id: "$subTopicId" } }
        ]);
        return activeSubTopics.map(t => t._id);
    }

    async findById(id: string): Promise<SubTopics> {
        return await this.subTopicModel.findOne({ _id: id })
            .populate('topicId', 'id topicName imageUrl status')
    }

    async update(id: string, UpdateSubTopicsDto: UpdateSubTopicsDto): Promise<SubTopics> {
        return this.subTopicModel.findOneAndUpdate({ _id: id }, UpdateSubTopicsDto).exec();
    }

    async delete(id: string): Promise<SubTopics> {
        const deletedSubTopic = await this.subTopicModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedSubTopic
    }

}