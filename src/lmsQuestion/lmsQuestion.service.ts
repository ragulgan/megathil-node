import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LmsQuestion } from './lmsQuestion.schema';
import { CreateLMSQuestionDto } from './dto/createLmsQuestion.dto';
import { UpdateLMSQuestionDto } from './dto/updateLmsQuestion.dto';
import * as _ from 'lodash';
import { Topics } from 'src/topics/topics.schema';
import { SubTopics } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1 } from 'src/sub-topics1/sub-topic1.schema';
import { LmsTest } from 'src/lmsTest/lmsTest.schema';
import { LmsProgressStatus } from 'src/lmsQuestionResponse/lmsQuestionResponse.schema';
import { LmsUserHistory } from 'src/lmsQuestionResponse/lmsUserHistory.schema';
import { LmsOption } from 'src/lmsOption/lmsOption.schema';
const mongoose = require('mongoose');

@Injectable()
export class LMSQustionsService {
    constructor(
        @InjectModel(Topics.name) private topicModel: Model<Topics>,
        @InjectModel(SubTopics.name) private subTopicModel: Model<SubTopics>,
        @InjectModel(SubTopics1.name) private subTopic1Model: Model<SubTopics1>,
        @InjectModel(LmsTest.name) private lmsTestModel: Model<LmsTest>,
        @InjectModel(LmsQuestion.name) private lmsQuestionModel: Model<LmsQuestion>,
        @InjectModel(LmsProgressStatus.name) private lmsProgressModel: Model<LmsProgressStatus>,
        @InjectModel(LmsUserHistory.name) private LmsUserHistoryModel: Model<LmsUserHistory>,
        @InjectModel(LmsOption.name) private lmsOptionModel: Model<LmsOption>,
    ) { }

    async create(createLmsQuestionDto: CreateLMSQuestionDto): Promise<LmsQuestion> {
        try {
            const createdLmsQuestionTest = new this.lmsQuestionModel(createLmsQuestionDto);
            const data = await createdLmsQuestionTest.save();
            await this.lmsQuestionModel.findOneAndUpdate({ _id: data._id }, { questionlId: data._id }).exec();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Module.");
        }
    }

    async findMinimalByTestLevelId(queryParams: any, topicId: string, subTopicId: string, subTopic1Id: string, testLevelId: string, userData = null) {
        const parsedPage = parseInt(String(queryParams.page), 10) || 1;
        const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
        const skipValue = (parsedPage - 1) * parsedLimit;
        const ObjectId = mongoose.Types.ObjectId;
        const topicObjectId = new ObjectId(topicId);
        const suptopicObjectId = new ObjectId(subTopicId);
        const suptopic1ObjectId = new ObjectId(subTopic1Id);
        const testLevelObjectId = new ObjectId(testLevelId);
        const match: any = { status: 'ACTIVE', topicId: topicObjectId, subTopicId: suptopicObjectId, subTopic1Id: suptopic1ObjectId, testLevelId: testLevelObjectId };
        if (queryParams.status) {
            match.status = queryParams.status;
        }
        if (!userData || (userData.role != 'SUPER_ADMIN' && userData.role != 'ADMIN')) {
            match._id = { $in: await this.getQuestionWithActiveOptions() };
        }
        const count = await this.lmsQuestionModel.countDocuments(match).exec();
        const lmsQuestionList = await this.lmsQuestionModel.aggregate([
            { $match: match },
            // { $skip: skipValue },
            // { $limit: parsedLimit },
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
            {
                $lookup: {
                    from: 'lmstests',
                    localField: 'testLevelId',
                    foreignField: '_id',
                    as: 'testLevelId',
                },
            },
            { $unwind: { path: '$topicId', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$subTopicId', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$subTopic1Id', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$testLevelId', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    questionlId: '$_id',
                    lmsQuestion: 1,
                    questionTiming: 1,
                    displayOrder: 1,
                    status: 1,
                    mcqImageUrl: 1,
                    mcqProgramming: 1,
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
                    testLevelId: {
                        id: '$testLevelId._id',
                        topicName: '$testLevelId.testLevel',
                        testTiming: '$testLevelId.testTiming',
                        testQuestionType: '$testLevelId.lmsQuestionType',
                    },
                },
            },
            { $sample: { size: count } }, // shuffle the matching data
        ]);
        const topic = await this.topicModel.findOne({ _id: topicId }).select("topicId topicName imageUrl status");
        const subTopic = await this.subTopicModel.findOne({ _id: subTopicId }).select("subTopicId subTopicName imageUrl status");
        const subTopic1 = await this.subTopic1Model.findOne({ _id: subTopic1Id }).select("subTopicId1 subTopicName1 imageUrl status");
        const testLevel = await this.lmsTestModel.findOne({ _id: testLevelId }).select("testLevelId testLevel testTiming status lmsQuestionType");
        return { lmsQuestionList, count, topic, subTopic, subTopic1, testLevel }
    }

    async getQuestionWithActiveOptions(): Promise<string[]> {
        const activeTopics = await this.lmsOptionModel.aggregate([
            { $match: { status: "ACTIVE" } },
            { $group: { _id: "$questionId" } }
        ]);
        return activeTopics.map(t => t._id);
    }

    async findById(id: string): Promise<LmsQuestion | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return this.lmsQuestionModel.findById(id)
            .populate('topicId', 'id topicName imageUrl status')
            .populate('subTopicId', 'id subTopicName imageUrl status')
            .populate('subTopic1Id', 'id subTopicName1 imageUrl status')
            .populate('testLevelId', 'id testLevel testTiming status lmsQuestionType')
    }

    async update(id: string, UpdateLmsQuestionDto: UpdateLMSQuestionDto): Promise<LmsQuestion> {
        return this.lmsQuestionModel.findOneAndUpdate({ _id: id }, UpdateLmsQuestionDto).exec();
    }

    async delete(id: string): Promise<LmsQuestion> {
        const deletedLmsQuestion = await this.lmsQuestionModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
            await this.lmsOptionModel.updateMany(
            { questionId: id },
            { $set: { status: 'DELETED' } }
        );
        return deletedLmsQuestion
    }

    async getLMSProgressByTestIdAndUserId(userId: string, testId: string): Promise<LmsProgressStatus | null> {
        return this.lmsProgressModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            testLevelId: new mongoose.Types.ObjectId(testId),
            }).exec();
    }

    async deleteLMSProgressStatusWithHistory(id: string): Promise<boolean> {
        const deletedProgress = await this.lmsProgressModel.findByIdAndDelete(id).exec();
        if (!deletedProgress) {
            return false;
        }
        await this.LmsUserHistoryModel.deleteMany({
            lmsProgressId: deletedProgress._id,
        }).exec();
        return true;
    }

}