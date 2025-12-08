import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LmsTest } from './lmsTest.schema';
import { CreateTestLevelDto } from './dto/createLmsTest.dto';
import { UpdateTestLevelDto } from './dto/updateLmsTest.dto';
import * as _ from 'lodash';
import { Topics } from 'src/topics/topics.schema';
import { SubTopics } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1 } from 'src/sub-topics1/sub-topic1.schema';
import { LmsQuestion } from 'src/lmsQuestion/lmsQuestion.schema';
const mongoose = require('mongoose');

@Injectable()
export class LmsTestService {
    constructor(
        @InjectModel(Topics.name) private topicModel: Model<Topics>,
        @InjectModel(SubTopics.name) private subTopicModel: Model<SubTopics>,
        @InjectModel(SubTopics1.name) private subTopic1Model: Model<SubTopics1>,
        @InjectModel(LmsTest.name) private lmsTestModel: Model<LmsTest>,
        @InjectModel(LmsQuestion.name) private LmsQuestionModel: Model<LmsQuestion>,
    ) { }

    async create(createTestLevelDto: CreateTestLevelDto): Promise<LmsTest> {
        try {
            const createdLmsTest = new this.lmsTestModel(createTestLevelDto);
            const data = await createdLmsTest.save();
            await this.lmsTestModel.findOneAndUpdate({ _id: data._id }, { testLevelId: data._id }).exec();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Module.");
        }
    }

    async findMinimalByTestLevelId(queryParams: any, topicId: string, subTopicId: string, subTopic1Id: string, userData = null) {
        const parsedPage = parseInt(String(queryParams.page), 10) || 1;
        const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
        const skipValue = (parsedPage - 1) * parsedLimit;
        const ObjectId = mongoose.Types.ObjectId;
        const topicObjectId = new ObjectId(topicId);
        const suptopicObjectId = new ObjectId(subTopicId);
        const suptopic1ObjectId = new ObjectId(subTopic1Id);
        const match: any = { status: 'ACTIVE', topicId: topicObjectId, subTopicId: suptopicObjectId, subTopic1Id: suptopic1ObjectId };
        if (queryParams.status) {
            match.status = queryParams.status;
        }
        if (!userData || (userData.role != 'SUPER_ADMIN' && userData.role != 'ADMIN')) {
            match._id = { $in: await this.getTestLevelWithActiveQuestions() };
        }
        const pipeline: any[] = [
            { $match: match },
            { $sort: { createdAt: 1 } },
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
            {
            $lookup: {
                from: 'subtopics1',
                localField: 'subTopic1Id',
                foreignField: '_id',
                as: 'subTopic1Id',
            },
            },
            { $unwind: { path: '$topicId', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$subTopicId', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$subTopic1Id', preserveNullAndEmptyArrays: true } },
        ];

        if (userData.role == 'USER') {
            pipeline.push({
            $lookup: {
                from: 'lmsprogressstatuses',
                let: { testId: '$_id', tId: '$topicId._id', stId: '$subTopicId._id', st1Id: '$subTopic1Id._id' },
                pipeline: [
                {
                    $match: {
                    $expr: {
                        $and: [
                        { $eq: ['$testLevelId', '$$testId'] },
                        { $eq: ['$userId', new ObjectId(userData.id)] },
                        { $eq: ['$topicId', '$$tId'] },
                        { $eq: ['$subTopicId', '$$stId'] },
                        { $eq: ['$subTopic1Id', '$$st1Id'] },
                        ],
                    },
                    },
                },
                { $project: { status: 1, _id: 0 } },
                ],
                as: 'progressStatus',
            },
            });

            pipeline.push({ $unwind: { path: '$progressStatus', preserveNullAndEmptyArrays: true } });
        }

        pipeline.push({
            $project: {
            _id: 0,
            id: '$_id',
            testLevelId: '$_id',
            testLevel: 1,
            testTiming: 1,
            lmsQuestionType: 1,
            description: 1,
            status: 1,
            displayOrder: 1,
            testStatus: userData.role === 'USER' ? '$progressStatus.status' : null,
            topicId: {
                id: '$topicId._id',
                topicName: '$topicId.topicName',
            },
            subTopicId: {
                id: '$subTopicId._id',
                topicName: '$subTopicId.subTopicName',
            },
            subTopic1Id: {
                id: '$subTopic1Id._id',
                topicName: '$subTopic1Id.subTopicName1',
            },
            },
        });
        const lmsTestList = await this.lmsTestModel.aggregate(pipeline);
        const count = await this.lmsTestModel.countDocuments(match).exec();
        const topic = await this.topicModel.findOne({ _id: topicId }).select("topicId topicName imageUrl status");
        const subTopic = await this.subTopicModel.findOne({ _id: subTopicId }).select("subTopicId subTopicName imageUrl status");
        const subTopic1 = await this.subTopic1Model.findOne({ _id: subTopic1Id }).select("subTopicId1 subTopicName1 imageUrl status");
        return { lmsTestList, count, topic, subTopic, subTopic1 }
    }

    async getTestLevelWithActiveQuestions(): Promise<string[]> {
        const activeTopics = await this.LmsQuestionModel.aggregate([
            { $match: { status: "ACTIVE" } },
            { $group: { _id: "$testLevelId" } }
        ]);
        return activeTopics.map(t => t._id);
    }

    async findById(id: string): Promise<LmsTest> {
        return await this.lmsTestModel.findOne({ _id: id })
            .populate('topicId', 'id topicName imageUrl status')
            .populate('subTopicId', 'id subTopicName imageUrl status')
            .populate('subTopic1Id', 'id subTopicName1 imageUrl status')
    }

    async update(id: string, UpdateTestLevelDto: UpdateTestLevelDto): Promise<LmsTest> {
        return this.lmsTestModel.findOneAndUpdate({ _id: id }, UpdateTestLevelDto).exec();
    }

    async delete(id: string): Promise<LmsTest> {
        const deletedTestLevel = await this.lmsTestModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedTestLevel
    }
}