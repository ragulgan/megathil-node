import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubTopics1 } from './sub-topic1.schema';
import { CreateSubTopics1Dto } from './dto/createSubTopic1.dto';
import { UpdateSubTopics1Dto } from './dto/updateSubTopic1.dto';
import * as _ from 'lodash';
import { Topics } from 'src/topics/topics.schema';
import { SubTopics } from 'src/sup-topics/sub-topics.schema';
import { LmsTest } from 'src/lmsTest/lmsTest.schema';
const mongoose = require('mongoose');

@Injectable()
export class SubTopic1Service {
    constructor(
        @InjectModel(Topics.name) private topicModel: Model<Topics>,
        @InjectModel(SubTopics.name) private subTopicModel: Model<SubTopics>,
        @InjectModel(SubTopics1.name) private subTopic1Model: Model<SubTopics1>,
        @InjectModel(LmsTest.name) private lmsTestModel: Model<LmsTest>,
    ) { }

    async create(createSubTopics1Dto: CreateSubTopics1Dto): Promise<SubTopics1> {
        try {
            const createdSubTopic1 = new this.subTopic1Model(createSubTopics1Dto);
            const data = await createdSubTopic1.save();
            await this.subTopic1Model.findOneAndUpdate({ _id: data._id }, { subTopicId1: data._id }).exec();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Module.");
        }
    }

    async findMinimalBySubTopic1Id(queryParams: any, topicId: string, subTopicId: string, decodedToken: any) {
        const parsedPage = parseInt(String(queryParams.page), 10) || 1;
        const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
        const skipValue = (parsedPage - 1) * parsedLimit;
        const ObjectId = mongoose.Types.ObjectId;
        const topicObjectId = new ObjectId(topicId);
        const suptopicObjectId = new ObjectId(subTopicId);
        const match: any = { status: 'ACTIVE', topicId: topicObjectId, subTopicId: suptopicObjectId };
        if (queryParams.status) {
            match.status = queryParams.status;
        }
        if (!decodedToken || (decodedToken.role != 'SUPER_ADMIN' && decodedToken.role != 'ADMIN')) {
            match._id = { $in: await this.getSubTopics1WithActiveTest() };
        }
        const subTopic1List = await this.subTopic1Model.aggregate([
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
            {
                $lookup: {
                    from: 'subtopics',
                    localField: 'subTopicId',
                    foreignField: '_id',
                    as: 'subTopicId',
                },
            },
            { $unwind: { path: '$topicId', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$subTopicId', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    subTopic1Id1: '$_id',
                    subTopicName1: 1,
                    imageUrl: 1,
                    description: 1,
                    status: 1,
                    topicId: {
                        id: '$topicId._id',
                        topicName: '$topicId.topicName',
                    },
                    subTopicId: {
                        id: '$subTopicId._id',
                        topicName: '$subTopicId.subTopicName',
                    },
                    displayOrder: 1,
                },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);
        const count = await this.subTopic1Model.countDocuments(match).exec();
        const topic = await this.topicModel.findOne({ _id: topicId }).select("topicId topicName imageUrl status");
        const subTopic = await this.subTopicModel.findOne({ _id: subTopicId }).select("subTopicId subTopicName imageUrl status");
        return { subTopic1List, count, topic, subTopic }
    }

    async getSubTopics1WithActiveTest(): Promise<string[]> {
        const activeSubTopics1 = await this.lmsTestModel.aggregate([
            { $match: { status: "ACTIVE" } },
            { $group: { _id: "$subTopic1Id" } }
        ]);
        return activeSubTopics1.map(t => t._id);
    }

    async findById(id: string): Promise<SubTopics1> {
        return await this.subTopic1Model.findOne({ _id: id })
            .populate('topicId', 'id topicName imageUrl status')
            .populate('subTopicId', 'id subTopicName imageUrl status')
    }

    async update(id: string, UpdateSubTopics1Dto: UpdateSubTopics1Dto): Promise<SubTopics1> {
        return this.subTopic1Model.findOneAndUpdate({ _id: id }, UpdateSubTopics1Dto).exec();
    }

    async delete(id: string): Promise<SubTopics1> {
        const deletedSubTopic1 = await this.subTopic1Model
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedSubTopic1
    }
}