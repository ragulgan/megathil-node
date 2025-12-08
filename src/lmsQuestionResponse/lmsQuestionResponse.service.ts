import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LmsProgressStatus } from './lmsQuestionResponse.schema';
import { LmsUserHistory } from './lmsUserHistory.schema'
import { CreateLMSQuestionResponseDto } from './dto/lmsQuestionResponse.dto';
import * as _ from 'lodash';
import { Topics } from 'src/topics/topics.schema';
import { SubTopics } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1 } from 'src/sub-topics1/sub-topic1.schema';
import { LmsTest } from 'src/lmsTest/lmsTest.schema';
import { LmsQuestion } from 'src/lmsQuestion/lmsQuestion.schema';
import { LmsOption } from 'src/lmsOption/lmsOption.schema';
import { UsersService } from 'src/users/users.service';
import { UpdateLMSQuestionResponseDto } from './dto/lmsQuestionResponseUpdate.dto';
import * as json2xls from 'json2xls';
import { stringSimilarity } from "string-similarity-js";
const mongoose = require('mongoose');

@Injectable()
export class LmsQuestionResponseService {
    constructor(
        @InjectModel(Topics.name) private topicModel: Model<Topics>,
        @InjectModel(SubTopics.name) private subTopicModel: Model<SubTopics>,
        @InjectModel(SubTopics1.name) private subTopic1Model: Model<SubTopics1>,
        @InjectModel(LmsTest.name) private LmsTestModel: Model<LmsTest>,
        @InjectModel(LmsQuestion.name) private LmsQuestionModel: Model<LmsQuestion>,
        @InjectModel(LmsOption.name) private LmsOptionModel: Model<LmsOption>,
        @InjectModel(LmsProgressStatus.name) private lmsProgressModel: Model<LmsProgressStatus>,
        @InjectModel(LmsUserHistory.name) private LmsUserHistoryModel: Model<LmsUserHistory>,
        private readonly usersService: UsersService,
    ) { }

    async create(createDto: CreateLMSQuestionResponseDto, userId: string): Promise<any> {
        try {
            // 1. Validate Option
            const option = await this.LmsOptionModel.findOne({
                _id: createDto.optionId,
                status: 'ACTIVE',
            }).exec();

            const testQuestionType = await this.LmsTestModel.findOne({ 
                _id: createDto.testLevelId, 
                status: 'ACTIVE' 
            }).exec();

            if (!option) {
                throw new Error('Invalid option: Option not found or inactive');
            }

            if (!testQuestionType) {
                throw new Error('Invalid test: Test not found or inactive');
            }

            let similarityPercentage = "0.00";
            if (createDto.workSpace && testQuestionType.lmsQuestionType === "ESSAY") {
                const similarityMatch = stringSimilarity(option.essayAnswer, createDto.workSpace);
                similarityPercentage = (similarityMatch * 100).toFixed(2);
            }

            const isValidOption = option?.validOption === true;

            // 2. Get total questions for this test/topic
            const totalQuestions = await this.LmsQuestionModel.countDocuments({
                topicId: createDto.topicId,
                subTopicId: createDto.subTopicId,
                subTopic1Id: createDto.subTopic1Id,
                testLevelId: createDto.testLevelId,
                status: { $ne: 'DELETED' }
            });

            // 3. Find existing progress or create new
            let progress = await this.lmsProgressModel.findOne({
                userId,
                topicId: createDto.topicId,
                subTopicId: createDto.subTopicId,
                subTopic1Id: createDto.subTopic1Id,
                testLevelId: createDto.testLevelId,
            });

            if (!progress) {
                // Create first time entry
                progress = new this.lmsProgressModel({
                    userId,
                    topicId: createDto.topicId,
                    subTopicId: createDto.subTopicId,
                    subTopic1Id: createDto.subTopic1Id,
                    testLevelId: createDto.testLevelId,
                    totalQuestion: totalQuestions,
                    correctQuestionCount: testQuestionType.lmsQuestionType === "ESSAY" ?  0 : isValidOption ? 1 : 0,
                    wrongQuestionCount: testQuestionType.lmsQuestionType === "ESSAY" ? 0 : isValidOption ? 0 : 1,
                    testTimingTaken: createDto.testTimingTaken,
                    testPercertage: testQuestionType.lmsQuestionType === "ESSAY" ? similarityPercentage : ((isValidOption ? 1 : 0) / totalQuestions * 100).toFixed(2),
                });
                try {
                    const topicIdData = await this.topicModel.findOne({ _id: createDto.topicId }).exec();
                    const subTopicIdData = await this.subTopicModel.findOne({ _id: createDto.subTopicId }).exec();
                    const subTopic1IdData = await this.subTopic1Model.findOne({ _id: createDto.subTopic1Id }).exec();
                    const testIdData = await this.LmsTestModel.findOne({ _id: createDto.testLevelId }).exec();
                    const params = {
                        userId: userId,
                        activity: "Started the lesson & activities in topic" +"  "+ `${topicIdData.topicName}` +"  " + `${subTopicIdData.subTopicName}` +"  "+ `${subTopic1IdData.subTopicName1}` +"  "+ `${testIdData.testLevel}`,
                        action: 'topic_started',
                        shortDescription: "Started the lesson & activities in topic" +"  "+ `${topicIdData.topicName}` +"  " + `${subTopicIdData.subTopicName}` +"  "+ `${subTopic1IdData.subTopicName1}` +"  "+ `${testIdData.testLevel}`,
                        topicId: createDto.topicId,
                        subTopicId: createDto.subTopicId,
                        subTopic1Id: createDto.subTopic1Id,
                        testLevelId: createDto.testLevelId,
                    };
                    this.usersService.logUserActivity(params).then(() => { });
                } catch { }
            } else {
                // Update existing entry
                if (testQuestionType.lmsQuestionType != "ESSAY") {
                    if (isValidOption) {
                        progress.correctQuestionCount = String(
                            Number(progress.correctQuestionCount || 0) + 1
                        );
                    } else {
                        progress.wrongQuestionCount = String(
                            Number(progress.wrongQuestionCount || 0) + 1
                        );
                    }

                progress.totalQuestion = String(totalQuestions);
                progress.testPercertage = ((Number(progress.correctQuestionCount) / totalQuestions) * 100).toFixed(2);
                progress.testTimingTaken = createDto.testTimingTaken;
                } else {
                    const allHistories = await this.LmsUserHistoryModel.find({
                        lmsProgressId: progress._id,
                    });

                    const essayScores = allHistories
                        .map((h) => Number(h.essayScore))
                        .filter((v) => !isNaN(v));

                    // include current answer too
                    essayScores.push(Number(similarityPercentage));

                    const averageScore = essayScores.length
                        ? (essayScores.reduce((a, b) => a + b, 0) / essayScores.length).toFixed(2)
                        : "0.00";

                    progress.testPercertage = averageScore;
                    progress.totalQuestion = String(totalQuestions);
                    progress.testTimingTaken = createDto.testTimingTaken;
                }
            }

            await progress.save();

            // 4. Save user history
            const history = new this.LmsUserHistoryModel({
                lmsProgressId: progress._id,
                questionId: createDto.questionId,
                optionId: createDto.optionId,
                questionResponse: testQuestionType.lmsQuestionType === "ESSAY" ? null : isValidOption,
                questionTimingTaken: createDto.questionTimingTaken,
                workSpace: createDto.workSpace,
                essayScore: testQuestionType.lmsQuestionType === "ESSAY" ? similarityPercentage : null,
            });

            await history.save();

            return {
                progressId: progress._id,
                optionValid: testQuestionType.lmsQuestionType === "ESSAY" ? null : isValidOption,
            };

        } catch (error) {
            console.error("Error while saving Question Response:", error);
            throw new Error("Error occurred while saving Question Response.");
        }
    }

    async update(updateDto: UpdateLMSQuestionResponseDto, userId: string): Promise<any> {
        try {
            const totalQuestions = await this.LmsQuestionModel.countDocuments({
                topicId: updateDto.topicId,
                subTopicId: updateDto.subTopicId,
                subTopic1Id: updateDto.subTopic1Id,
                testLevelId: updateDto.testLevelId,
                status: { $ne: 'DELETED' }
            });

            // 3. Find existing progress or create new
            let progress = await this.lmsProgressModel.findOne({
                userId,
                topicId: updateDto.topicId,
                subTopicId: updateDto.subTopicId,
                subTopic1Id: updateDto.subTopic1Id,
                testLevelId: updateDto.testLevelId,
            });

            if (!progress) {
                // Create first time entry
                let testIdData = await this.LmsTestModel.findOne({ _id: updateDto.testLevelId }).exec();
                let timing = testIdData.testTiming.toLowerCase().trim();
                let timingInSeconds = 0;

                // check for minutes
                if (timing.includes("min")) {
                    const num = parseInt(timing.replace(/[^0-9]/g, ""), 10); // extract number
                    timingInSeconds = num * 60; // seconds
                }
                progress = new this.lmsProgressModel({
                    userId,
                    topicId: updateDto.topicId,
                    subTopicId: updateDto.subTopicId,
                    subTopic1Id: updateDto.subTopic1Id,
                    testLevelId: updateDto.testLevelId,
                    totalQuestion: totalQuestions,
                    correctQuestionCount: 0,
                    wrongQuestionCount: totalQuestions,
                    testTimingTaken: timingInSeconds,
                    testPercertage: 0,
                });
                await progress.save();
            }
            const updatedProgress = await this.lmsProgressModel.findOneAndUpdate(
                {
                userId,
                topicId: updateDto.topicId,
                subTopicId: updateDto.subTopicId,
                subTopic1Id: updateDto.subTopic1Id,
                testLevelId: updateDto.testLevelId,
                },
                {
                $set: { status: updateDto.status },
                },
                { new: true },
            );

            return updatedProgress;

        } catch (error) {
            console.error("Error while saving Question Response:", error);
            throw new Error("Error occurred while saving Question Response.");
        }
    }

    async getUserHistoryWithProgress(userId: string) {
        const result = await this.LmsUserHistoryModel.aggregate([
            // Join with progress status
            {
                $lookup: {
                    from: 'lmsprogressstatuses',
                    localField: 'lmsProgressId',
                    foreignField: '_id',
                    as: 'progress'
                }
            },
            { $unwind: '$progress' },

            // Filter by userId
            {
                $match: {
                    'progress.userId': new mongoose.Types.ObjectId(userId)
                }
            },

            // Lookup Topic
            {
                $lookup: {
                    from: 'topics',
                    localField: 'progress.topicId',
                    foreignField: '_id',
                    as: 'topic'
                }
            },
            { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },

            // Lookup SubTopic
            {
                $lookup: {
                    from: 'subtopics',
                    localField: 'progress.subTopicId',
                    foreignField: '_id',
                    as: 'subTopic'
                }
            },
            { $unwind: { path: '$subTopic', preserveNullAndEmptyArrays: true } },

            // Lookup SubTopic1
            {
                $lookup: {
                    from: 'subtopics1',
                    localField: 'progress.subTopic1Id',
                    foreignField: '_id',
                    as: 'subTopic1'
                }
            },
            { $unwind: { path: '$subTopic1', preserveNullAndEmptyArrays: true } },

            // Lookup TestLevel
            {
                $lookup: {
                    from: 'lmstests',
                    localField: 'progress.testLevelId',
                    foreignField: '_id',
                    as: 'testLevel'
                }
            },
            { $unwind: { path: '$testLevel', preserveNullAndEmptyArrays: true } },

            // Lookup Question
            {
                $lookup: {
                    from: 'lmsquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },

            // Lookup Selected Option
            {
                $lookup: {
                    from: 'lmsoptions',
                    localField: 'optionId',
                    foreignField: '_id',
                    as: 'selectedOption'
                }
            },
            { $unwind: '$selectedOption' },

            // Lookup All Options
            {
                $lookup: {
                    from: 'lmsoptions',
                    localField: 'questionId',
                    foreignField: 'questionId',
                    as: 'allOptions'
                }
            },

            // Mark correct + wrong options
            {
                $addFields: {
                    correctOptions: {
                        $filter: {
                            input: '$allOptions',
                            as: 'opt',
                            cond: { $eq: ['$$opt.validOption', true] }
                        }
                    },
                    wrongOptions: {
                        $filter: {
                            input: '$allOptions',
                            as: 'opt',
                            cond: { $eq: ['$$opt.validOption', false] }
                        }
                    }
                }
            },

            // Group by Progress (so progress is only one object)
            {
                $group: {
                    _id: '$progress._id',
                    progress: { $first: '$progress' },
                    topic: { $first: '$topic' },
                    subTopic: { $first: '$subTopic' },
                    subTopic1: { $first: '$subTopic1' },
                    testLevel: { $first: '$testLevel' },
                    questions: {
                        $push: {
                            id: '$_id',
                            question: '$question.lmsQuestion',
                            questionResponse: '$questionResponse',
                            questionTimingTaken: '$questionTimingTaken',
                            questionImage:  '$question.mcqImageUrl',
                            questionProgramming:  '$question.mcqProgramming',
                            workSpace: '$workSpace',
                            essayScore: '$essayScore',
                            selectedOption: {
                                id: '$selectedOption._id',
                                text: '$selectedOption.lmsOption'
                            },
                            options: {
                                $cond: [
                                    '$questionResponse',
                                    '$correctOptions',
                                    { $concatArrays: ['$correctOptions', ['$selectedOption']] }
                                ]
                            }
                        }
                    },
                    totalTimeTaken: { $sum: { $toInt: '$questionTimingTaken' } },
                    attemptedCount: {
                        $sum: {
                            $cond: [{ $ifNull: ['$questionTimingTaken', false] }, 1, 0]
                        }
                    }
                }
            },

            // Shape final response
            {
                $project: {
                    _id: 0,
                    progress: {
                        id: '$_id',
                        totalQuestion: '$progress.totalQuestion',
                        correctQuestionCount: '$progress.correctQuestionCount',
                        wrongQuestionCount: '$progress.wrongQuestionCount',
                        testPercertage: '$progress.testPercertage',
                        completedOn: '$progress.updatedAt',
                        testTimingTaken: '$totalTimeTaken',
                        topicId: '$topic._id',
                        topicName: '$topic.topicName',
                        topicImage: '$topic.imageUrl',
                        subTopicId: '$subTopic._id',
                        subTopicName: '$subTopic.subTopicName',
                        subTopic1Id: '$subTopic1._id',
                        subTopic1Name: '$subTopic1.subTopicName1',
                        testId: '$testLevel._id',
                        testLevelName: '$testLevel.testLevel',
                        testQuestionType: '$testLevel.lmsQuestionType',
                        averageTimeTaken: {
                            $cond: [
                            { $gt: ['$attemptedCount', 0] },
                            { $divide: ['$totalTimeTaken', { $toInt: '$attemptedCount' }] },
                            0
                            ]
                        },
                        createdAt: '$progress.createdAt'
                    },
                    questions: 1
                }
            },
            { $sort: { 'progress.createdAt': -1 } }
        ]);

        return result || {};
    }

    async getUserHistoryWithLastTestAttendProgress(userId: string) {
        const result = await this.LmsUserHistoryModel.aggregate([
            // 1. Match only this user's history
            {
                $lookup: {
                    from: 'lmsprogressstatuses',
                    localField: 'lmsProgressId',
                    foreignField: '_id',
                    as: 'progress'
                }
            },
            { $unwind: '$progress' },

            {
                $match: {
                    'progress.userId': new mongoose.Types.ObjectId(userId)
                }
            },
            // Get only latest progress entry per user
            {
                $setWindowFields: {
                    partitionBy: '$progress.userId',
                    sortBy: { 'progress.createdAt': -1 },
                    output: { latestCreatedAt: { $first: '$progress.createdAt' } }
                }
            },
            {
                $match: { $expr: { $eq: ['$progress.createdAt', '$latestCreatedAt'] } }
            },

            // Lookup Topic
            {
                $lookup: {
                    from: 'topics',
                    localField: 'progress.topicId',
                    foreignField: '_id',
                    as: 'topic'
                }
            },
            { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },

            // Lookup SubTopic
            {
                $lookup: {
                    from: 'subtopics',
                    localField: 'progress.subTopicId',
                    foreignField: '_id',
                    as: 'subTopic'
                }
            },
            { $unwind: { path: '$subTopic', preserveNullAndEmptyArrays: true } },

            // Lookup SubTopic1
            {
                $lookup: {
                    from: 'subtopics1',
                    localField: 'progress.subTopic1Id',
                    foreignField: '_id',
                    as: 'subTopic1'
                }
            },
            { $unwind: { path: '$subTopic1', preserveNullAndEmptyArrays: true } },

            // Lookup TestLevel
            {
                $lookup: {
                    from: 'lmstests',
                    localField: 'progress.testLevelId',
                    foreignField: '_id',
                    as: 'testLevel'
                }
            },
            { $unwind: { path: '$testLevel', preserveNullAndEmptyArrays: true } },

            // Lookup Question
            {
                $lookup: {
                    from: 'lmsquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },

            // Lookup Selected Option
            {
                $lookup: {
                    from: 'lmsoptions',
                    localField: 'optionId',
                    foreignField: '_id',
                    as: 'selectedOption'
                }
            },
            { $unwind: '$selectedOption' },

            // Lookup All Options
            {
                $lookup: {
                    from: 'lmsoptions',
                    localField: 'questionId',
                    foreignField: 'questionId',
                    as: 'allOptions'
                }
            },

            // Mark correct + wrong options
            {
                $addFields: {
                    correctOptions: {
                        $filter: {
                            input: '$allOptions',
                            as: 'opt',
                            cond: { $eq: ['$$opt.validOption', true] }
                        }
                    },
                    wrongOptions: {
                        $filter: {
                            input: '$allOptions',
                            as: 'opt',
                            cond: { $eq: ['$$opt.validOption', false] }
                        }
                    }
                }
            },
            //question order by createdAt asc
            {
                $sort: { 'question.createdAt': 1 }
            },
            // Group by Progress
            {
                $group: {
                    _id: '$progress._id',
                    progress: { $first: '$progress' },
                    topic: { $first: '$topic' },
                    subTopic: { $first: '$subTopic' },
                    subTopic1: { $first: '$subTopic1' },
                    testLevel: { $first: '$testLevel' },

                    questions: {
                        $push: {
                            id: '$_id',
                            question: '$question.lmsQuestion',
                            questionResponse: '$questionResponse',
                            questionTimingTaken: '$questionTimingTaken',
                            questionImage:  '$question.mcqImageUrl',
                            questionProgramming:  '$question.mcqProgramming',
                            workSpace: '$workSpace',
                            essayScore: '$essayScore',
                            selectedOption: {
                            id: '$selectedOption._id',
                            text: '$selectedOption.lmsOption'
                            },
                            options: {
                            $cond: [
                                '$questionResponse',
                                '$correctOptions',
                                { $concatArrays: ['$correctOptions', ['$selectedOption']] }
                            ]
                            }
                        }
                    },
                    totalTimeTaken: { $sum: { $toInt: '$questionTimingTaken' } },
                    attemptedCount: {
                        $sum: {
                            $cond: [{ $ifNull: ['$questionTimingTaken', false] }, 1, 0]
                        }
                    }
                }
            },

            // Shape final response
            {
                $project: {
                    _id: 0,
                    progress: {
                        id: '$_id',
                        totalQuestion: '$progress.totalQuestion',
                        correctQuestionCount: '$progress.correctQuestionCount',
                        wrongQuestionCount: '$progress.wrongQuestionCount',
                        testPercertage: '$progress.testPercertage',
                        completedOn: '$progress.updatedAt',
                        status: '$progress.status',
                        testTimingTaken: '$totalTimeTaken',
                        topicId: '$topic._id',
                        topicName: '$topic.topicName',
                        topicImage: '$topic.imageUrl',
                        subTopicId: '$subTopic._id',
                        subTopicName: '$subTopic.subTopicName',
                        subTopic1Id: '$subTopic1._id',
                        subTopic1Name: '$subTopic1.subTopicName1',
                        testId: '$testLevel._id',
                        testLevelName: '$testLevel.testLevel',
                        testQuestionType: '$testLevel.lmsQuestionType',
                        averageTimeTaken: {
                            $cond: [
                            { $gt: ['$attemptedCount', 0] },
                            { $divide: ['$totalTimeTaken', { $toInt: '$attemptedCount' }] },
                            0
                            ]
                        },
                    },
                    questions: 1
                }
            }
        ]);
        return result[0] || {};
    }

    async   getUserHistoryWithCompletedTestProgress(userId: string, testId?: string) {
    const pipeline: any[] = [
        {
            $lookup: {
                from: 'lmsprogressstatuses',
                localField: 'lmsProgressId',
                foreignField: '_id',
                as: 'progress'
            }
        },
        { $unwind: '$progress' },

        // Filter user
        {
            $match: {
                'progress.userId': new mongoose.Types.ObjectId(userId)
            }
        }
    ];

    // Optional Test ID filter
    if (testId) {
        pipeline.push({
            $match: {
                'progress.testLevelId': new mongoose.Types.ObjectId(testId)
            }
        });
    }

    // Continue with sorting, lookups, grouping …
    pipeline.push(
        {
            $setWindowFields: {
                partitionBy: '$progress.userId',
                sortBy: { 'progress.createdAt': -1 },
                output: { latestCreatedAt: { $first: '$progress.createdAt' } }
            }
        },
        {
            $match: { $expr: { $eq: ['$progress.createdAt', '$latestCreatedAt'] } }
        },

        // --- (rest of your existing pipeline unchanged) ---
        {
            $lookup: {
                from: 'topics',
                localField: 'progress.topicId',
                foreignField: '_id',
                as: 'topic'
            }
        },
        { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'subtopics',
                localField: 'progress.subTopicId',
                foreignField: '_id',
                as: 'subTopic'
            }
        },
        { $unwind: { path: '$subTopic', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'subtopics1',
                localField: 'progress.subTopic1Id',
                foreignField: '_id',
                as: 'subTopic1'
            }
        },
        { $unwind: { path: '$subTopic1', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'lmstests',
                localField: 'progress.testLevelId',
                foreignField: '_id',
                as: 'testLevel'
            }
        },
        { $unwind: { path: '$testLevel', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'lmsquestions',
                localField: 'questionId',
                foreignField: '_id',
                as: 'question'
            }
        },
        { $unwind: '$question' },

        {
            $lookup: {
                from: 'lmsoptions',
                localField: 'optionId',
                foreignField: '_id',
                as: 'selectedOption'
            }
        },
        { $unwind: '$selectedOption' },

        {
            $lookup: {
                from: 'lmsoptions',
                localField: 'questionId',
                foreignField: 'questionId',
                as: 'allOptions'
            }
        },

        {
            $addFields: {
                correctOptions: {
                    $filter: {
                        input: '$allOptions',
                        as: 'opt',
                        cond: { $eq: ['$$opt.validOption', true] }
                    }
                },
                wrongOptions: {
                    $filter: {
                        input: '$allOptions',
                        as: 'opt',
                        cond: { $eq: ['$$opt.validOption', false] }
                    }
                }
            }
        },
        { $sort: { 'question.createdAt': 1 } },

        {
            $group: {
                _id: '$progress._id',
                progress: { $first: '$progress' },
                topic: { $first: '$topic' },
                subTopic: { $first: '$subTopic' },
                subTopic1: { $first: '$subTopic1' },
                testLevel: { $first: '$testLevel' },
                questions: {
                    $push: {
                        id: '$_id',
                        question: '$question.lmsQuestion',
                        questionResponse: '$questionResponse',
                        questionTimingTaken: '$questionTimingTaken',
                        questionImage: '$question.mcqImageUrl',
                        questionProgramming: '$question.mcqProgramming',
                        workSpace: '$workSpace',
                        essayScore: '$essayScore',
                        selectedOption: {
                            id: '$selectedOption._id',
                            text: '$selectedOption.lmsOption'
                        },
                        options: {
                            $cond: [
                                '$questionResponse',
                                '$correctOptions',
                                { $concatArrays: ['$correctOptions', ['$selectedOption']] }
                            ]
                        }
                    }
                },
                totalTimeTaken: { $sum: { $toInt: '$questionTimingTaken' } },
                attemptedCount: {
                    $sum: {
                        $cond: [
                            { $ifNull: ['$questionTimingTaken', false] }, 1, 0
                        ]
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,
                progress: {
                    id: '$_id',
                    totalQuestion: '$progress.totalQuestion',
                    correctQuestionCount: '$progress.correctQuestionCount',
                    wrongQuestionCount: '$progress.wrongQuestionCount',
                    testPercertage: '$progress.testPercertage',
                    status: '$progress.status',
                    testTimingTaken: '$totalTimeTaken',
                    topicId: '$topic._id',
                    topicName: '$topic.topicName',
                    topicImage: '$topic.imageUrl',
                    subTopicId: '$subTopic._id',
                    subTopicName: '$subTopic.subTopicName',
                    subTopic1Id: '$subTopic1._id',
                    subTopic1Name: '$subTopic1.subTopicName1',
                    testId: '$testLevel._id',
                    testLevelName: '$testLevel.testLevel',
                    testQuestionType: '$testLevel.lmsQuestionType',
                    averageTimeTaken: {
                        $cond: [
                            { $gt: ['$attemptedCount', 0] },
                            { $divide: ['$totalTimeTaken', { $toInt: '$attemptedCount' }] },
                            0
                        ]
                    },
                },
                questions: 1
            }
        }
    );

    const result = await this.LmsUserHistoryModel.aggregate(pipeline);
    return result[0] || {};
}

    async getUserProgressDetails(
        collegeId: string,
        departmentId: string,
        topicId: string,
        subTopicId: string,
        subTopic1Id: string,
        testId: string,
        queryParams: any
        ) {
        const ObjectId = mongoose.Types.ObjectId;

        // Build date filter for createdAt
        const dateFilter: any = {};
        if (queryParams.fromDate || queryParams.toDate) {
            dateFilter.createdAt = {};
            if (queryParams.fromDate) {
                dateFilter.createdAt.$gte = new Date(queryParams.fromDate);
            }
            if (queryParams.toDate) {
                // Set toDate to end of day (23:59:59.999)
                const toDate = new Date(queryParams.toDate);
                toDate.setHours(23, 59, 59, 999);
                dateFilter.createdAt.$lte = toDate;
            }
        }

        // Start building pipeline
        const pipeline: any[] = [
            // 1. Filter progress by topic, subTopic, test etc.
            {
            $match: {
                topicId: new ObjectId(topicId),
                subTopicId: new ObjectId(subTopicId),
                subTopic1Id: new ObjectId(subTopic1Id),
                testLevelId: new ObjectId(testId),
                status: 'COMPLETED',
                ...dateFilter,
            },
            },

            // 2. Join with User
            {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
            },
            },
            { $unwind: '$user' },

            // 3. Always filter by college
            {
            $match: {
                'user.college': new ObjectId(collegeId),
            },
            },
        ];

        // Conditionally filter by department (skip if "ALL")
        if (departmentId !== 'ALL') {
            pipeline.push({
            $match: {
                'user.department': new ObjectId(departmentId),
            },
            });
        }

        // 4. Join College + Department names
        pipeline.push(
            {
            $lookup: {
                from: 'colleges',
                localField: 'user.college',
                foreignField: '_id',
                as: 'college',
            },
            },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            {
            $lookup: {
                from: 'departments',
                localField: 'user.department',
                foreignField: '_id',
                as: 'department',
            },
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },

            // 5. Join UserHistory to compute timings
            {
            $lookup: {
                from: 'lmsuserhistories',
                localField: '_id',
                foreignField: 'lmsProgressId',
                as: 'history',
            },
            },

            // 6. Lookup Topic, SubTopic, SubTopic1, Test
            {
            $lookup: {
                from: 'topics',
                localField: 'topicId',
                foreignField: '_id',
                as: 'topic',
            },
            },
            { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
            {
            $lookup: {
                from: 'subtopics',
                localField: 'subTopicId',
                foreignField: '_id',
                as: 'subTopic',
            },
            },
            { $unwind: { path: '$subTopic', preserveNullAndEmptyArrays: true } },
            {
            $lookup: {
                from: 'subtopics1',
                localField: 'subTopic1Id',
                foreignField: '_id',
                as: 'subTopic1',
            },
            },
            { $unwind: { path: '$subTopic1', preserveNullAndEmptyArrays: true } },
            {
            $lookup: {
                from: 'lmstests',
                localField: 'testLevelId',
                foreignField: '_id',
                as: 'test',
            },
            },
            { $unwind: { path: '$test', preserveNullAndEmptyArrays: true } },

            // 7. Add calculated fields
            {
            $addFields: {
                totalTimeTaken: {
                $sum: {
                    $map: {
                    input: '$history',
                    as: 'h',
                    in: { $toInt: '$$h.questionTimingTaken' },
                    },
                },
                },
                averageTimeTaken: {
                $cond: [
                    { $gt: [{ $size: '$history' }, 0] },
                    {
                    $divide: [
                        {
                        $sum: {
                            $map: {
                            input: '$history',
                            as: 'h',
                            in: { $toInt: '$$h.questionTimingTaken' },
                            },
                        },
                        },
                        { $size: '$history' },
                    ],
                    },
                    0,
                ],
                },
                testStartTime: { $min: '$history.createdAt' },
                testEndTime: { $max: '$history.createdAt' },
                testDuration: {
                $cond: [
                    {
                    $and: [
                        { $min: '$history.createdAt' },
                        { $max: '$history.createdAt' },
                    ],
                    },
                    {
                    $subtract: [
                        { $max: '$history.createdAt' },
                        { $min: '$history.createdAt' },
                    ],
                    },
                    null,
                ],
                },
            },
            },

            // 8. Final projection
            {
            $project: {
                _id: 0,
                userId: '$user._id',
                firstName: '$user.firstName',
                lastName: '$user.lastName',
                email: '$user.email',
                lmsSource: '$user.lmsSource',
                collegeName: '$college.name',
                departmentName: '$department.name',
                progressStatus: '$status',
                createdAt: '$createdAt',
                correctQuestionCount: '$correctQuestionCount',
                wrongQuestionCount: '$wrongQuestionCount',
                testPercertage: '$testPercertage',
                totalQuestion: '$totalQuestion',
                totalTimeTaken: 1,
                averageTimeTaken: 1,
                testStartTime: 1,
                testEndTime: 1,
                testDuration: 1,
                topicName: '$topic.topicName',
                subTopicName: '$subTopic.subTopicName',
                subTopic1Name: '$subTopic1.subTopicName1',
                testLevelName: '$test.testLevel',
            },
            }
        );

        return this.lmsProgressModel.aggregate(pipeline);
    }

    convertJsonToExcel(jsonData: any): Buffer {
        const xls = json2xls(jsonData);
        return Buffer.from(xls, 'binary');
    }

}