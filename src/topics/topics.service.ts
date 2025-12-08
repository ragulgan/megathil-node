import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Topics } from './topics.schema';
import { User } from 'src/users/users.schema';
import { College } from 'src/college/college.schema';
import { CreateTopicsDto } from './dto/createTopics.dto';
import { UpdateTopicsDto } from './dto/updateTopics.dto';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LmsQuestion } from 'src/lmsQuestion/lmsQuestion.schema';
import { SubTopics } from 'src/sup-topics/sub-topics.schema';
import { SubTopics1 } from 'src/sub-topics1/sub-topic1.schema';
import { LmsTest } from 'src/lmsTest/lmsTest.schema';
import { LmsOption } from 'src/lmsOption/lmsOption.schema';
const mongoose = require('mongoose');

@Injectable()
export class TopicsService {
    constructor(
        @InjectModel(Topics.name) private topicsModel: Model<Topics>,
        @InjectModel(User.name) private UsersModel: Model<User>,
        @InjectModel(College.name) private collegeModel: Model<College>,
        @InjectModel(LmsQuestion.name) private LmsQuestionModel: Model<LmsQuestion>,
        @InjectModel(SubTopics.name) private subTopicModel: Model<SubTopics>,
        @InjectModel(SubTopics1.name) private subTopic1Model: Model<SubTopics1>,
        @InjectModel(LmsTest.name) private lmsTestModel: Model<LmsTest>,
        @InjectModel(LmsOption.name) private lmsOptionModel: Model<LmsOption>,
    ) { }

    async create(createTopicsDto: CreateTopicsDto): Promise<Topics> {
        try {
            const createdTopics = new this.topicsModel(createTopicsDto);
            const data = await createdTopics.save();
            await this.topicsModel.findOneAndUpdate({ _id: data._id }, { topicId: data._id }).exec();
            return data

        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Topics.");
        }
    }

    // async findAll(queryParams: any) {
    //     const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    //     const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    //     const skipValue = (parsedPage - 1) * parsedLimit;
    //     let match: any = { status: 'ACTIVE' }
    //     if (queryParams.status) {
    //         match.status = queryParams.status
    //     }

    //     if (queryParams.topicName || queryParams.topicSource) {
    //         const orCondition = []
    //         if (queryParams.topicName) {
    //             const splitValue = queryParams.topicName.split(' ');
    //             const filteredArr = splitValue.filter(entry => /\S/.test(entry));
    //             const topicName = filteredArr[0];
    //             if (topicName) {
    //                 orCondition.push({
    //                     topicName: new RegExp(`${topicName}`, 'i')
    //                 });
    //             }
    //         }
    //         if (queryParams.topicSource) {
    //             const splitValue = queryParams.topicSource.split(' ');
    //             const filteredArr = splitValue.filter(entry => /\S/.test(entry));
    //             const topicSource = filteredArr[0];
    //             if (topicSource) {
    //                 orCondition.push({
    //                     topicSource: new RegExp(`${topicSource}`, 'i')
    //                 });
    //             }
    //         }
    //         match = { ...match, $or: orCondition }
    //     }

    //     if (queryParams.userId) {
    //         const user = await this.UsersModel.findOne({ _id: queryParams.userId, status: { $ne: "DELETED" } });
    //         if (user) {
    //             if (user.lmsSource === 'LMS_ADMIN' && user.lmsUserType === 'PREMIUM' && user.college) {
    //                 const college = await this.collegeModel.findById(user.college).exec();
    //                 if (college?.topicsId?.length) {
    //                     match._id = { $in: college.topicsId };
    //                 } else {
    //                     return { topicList: [], count: 0 };
    //                 }
    //             } else if (user.lmsSource === 'LMS_WEB') {
    //                 match.topicSource = { $eq: 'GENERAL'};
    //             }
    //         }
    //     }

    //     const topicList = await this.topicsModel.aggregate([
    //         { $match: match },
    //         {
    //             $project: {
    //                 _id: 0,
    //                 id: "$_id",
    //                 topicId: "$_id",
    //                 topicName: 1,
    //                 topicSource: 1,
    //                 imageUrl: 1,
    //                 displayOrder: 1,
    //                 description: 1,
    //                 status: 1,
    //                 price: 1,
    //                 createdAt: 1,
    //                 updatedAt: 1,
    //             }
    //         },
    //         { $sort: { createdAt: 1 } },
    //         { $skip: skipValue },
    //         { $limit: parsedLimit },
    //     ]);
    //     const count = await this.topicsModel.countDocuments(match).exec()
    //     return { topicList, count };
    // }
    
    async findAll(queryParams: any, decodedToken: any) {
        const parsedPage = parseInt(String(queryParams.page), 10) || 1;
        const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
        const skipValue = (parsedPage - 1) * parsedLimit;
        let match: any = { status: 'ACTIVE' }
        if (queryParams.status) {
            match.status = queryParams.status
        }

        if (queryParams.topicName || queryParams.topicSource) {
            const orCondition = []
            if (queryParams.topicName) {
                const splitValue = queryParams.topicName.split(' ');
                const filteredArr = splitValue.filter(entry => /\S/.test(entry));
                const topicName = filteredArr[0];
                if (topicName) {
                    orCondition.push({
                        topicName: new RegExp(`${topicName}`, 'i')
                    });
                }
            }
            if (queryParams.topicSource) {
                const splitValue = queryParams.topicSource.split(' ');
                const filteredArr = splitValue.filter(entry => /\S/.test(entry));
                const topicSource = filteredArr[0];
                if (topicSource) {
                    orCondition.push({
                        topicSource: new RegExp(`${topicSource}`, 'i')
                    });
                }
            }
            match = { ...match, $or: orCondition }
        }
        if (!decodedToken || (decodedToken.role != 'SUPER_ADMIN' && decodedToken.role != 'ADMIN')) {
            match._id = { $in: await this.getTopicsWithActiveQuestions() };
        }
        if (queryParams.userId) {
            const user = await this.UsersModel.findOne({ _id: queryParams.userId, status: { $ne: "DELETED" } });
            if (user) {
                if (user.lmsSource === 'LMS_ADMIN' && user.lmsUserType === 'PREMIUM' && user.college) {
                    const college = await this.collegeModel.findById(user.college).exec();
                    if (college?.topicsId?.length) {
                        if (match._id?.$in) {
                            const currentTopics = match._id.$in;
                            match._id.$in = currentTopics.filter((id: any) =>
                                college.topicsId.map(String).includes(String(id))
                            );
                        } else {
                            match._id = { $in: college.topicsId };
                        }
                    } else {
                        return { topicList: [], count: 0 };
                    }
                } else if (user.lmsSource === 'LMS_WEB') {
                    match.topicSource = { $eq: 'GENERAL'};
                }
            }
        }
        const endOfDay = moment.utc().toDate();
        const topicList = await this.topicsModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "gemspackagecarousels",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$status", "ACTIVE"] },
                                        { $lte: ["$validStartDate", endOfDay] },
                                        { $gte: ["$validEndDate", endOfDay] }
                                    ]
                                }
                            }
                        }
                    ],
                    localField: "_id",
                    foreignField: "topicsId",
                    as: "offerDetails"
                }
            },

            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    topicId: "$_id",
                    topicName: 1,
                    topicSource: 1,
                    imageUrl: 1,
                    displayOrder: 1,
                    description: 1,
                    status: 1,
                    price: 1,
                    createdAt: 1,
                    updatedAt: 1,

                    // include the offers
                    offerDetails: {
                        $map: {
                            input: "$offerDetails",
                            as: "offer",
                            in: {
                                id: "$$offer._id",
                                title: "$$offer.title",
                                note: "$$offer.note",
                                imageUrl: "$$offer.imageUrl",
                                displayOrder: "$$offer.displayOrder",
                                promoCode: "$$offer.promoCode",
                                percentage: "$$offer.percentage",
                                validStartDate: "$$offer.validStartDate",
                                validEndDate: "$$offer.validEndDate",
                                status: "$$offer.status",
                                isLMSOffer: "$$offer.isLMSOffer",
                            }
                        }
                    }
                }
            },
            { $sort: { createdAt: 1 } },
            { $skip: skipValue },
            { $limit: parsedLimit },
        ]);
        const count = await this.topicsModel.countDocuments(match).exec()
        return { topicList, count };
    }

    async getTopicsWithActiveQuestions(): Promise<string[]> {
        const activeTopics = await this.LmsQuestionModel.aggregate([
            { $match: { status: "ACTIVE" } },
            { $group: { _id: "$topicId" } }
        ]);
        return activeTopics.map(t => t._id);
    }

    async findById(id: string): Promise<Topics> {
        return await this.topicsModel.findOne({ _id: id });
    }

    async getTopicHierarchy(topicId: string) {
        const ObjectId = mongoose.Types.ObjectId;

        return this.topicsModel.aggregate([
            // 1. Match Topic
            { $match: { _id: new ObjectId(topicId) } },

            // 2. Lookup SubTopics
            {
                $lookup: {
                    from: 'subtopics',
                    let: { topicId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$topicId', '$$topicId'] }, status: "ACTIVE" } }
                    ],
                    as: 'subTopics'
                }
            },

            // 3. Lookup SubTopic1 for each SubTopic
            {
                $lookup: {
                    from: 'subtopics1',
                    let: { subTopicIds: '$subTopics._id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$subTopicId', '$$subTopicIds'] }, status: "ACTIVE" } }
                    ],
                    as: 'subTopics1'
                }
            },

            // 4. Lookup Tests for each SubTopic1
            {
                $lookup: {
                    from: 'lmstests',
                    let: { st1Ids: '$subTopics1._id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$subTopic1Id', '$$st1Ids'] }, status: "ACTIVE" } }
                    ],
                    as: 'tests'
                }
            },

            // 5. Lookup Questions for each Test
            {
                $lookup: {
                    from: 'lmsquestions',
                    let: { testIds: '$tests._id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$testLevelId', '$$testIds'] }, status: "ACTIVE" } }
                    ],
                    as: 'questions'
                }
            },

            // 6. Lookup Options for each Question
            {
                $lookup: {
                    from: 'lmsoptions',
                    let: { qIds: '$questions._id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$questionId', '$$qIds'] }, status: "ACTIVE" } }
                    ],
                    as: 'options'
                }
            },

            // 7. Rebuild Nested Structure
            {
                $addFields: {
                    subTopics: {
                        $map: {
                            input: '$subTopics',
                            as: 'st',
                            in: {
                                _id: '$$st._id',
                                subTopicName: '$$st.subTopicName',
                                description: '$$st.description',
                                imageUrl: '$$st.imageUrl',
                                subTopics1: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: '$subTopics1',
                                                as: 'st1',
                                                cond: { $eq: ['$$st1.subTopicId', '$$st._id'] }
                                            }
                                        },
                                        as: 'st1',
                                        in: {
                                            _id: '$$st1._id',
                                            subTopicName1: '$$st1.subTopicName1',
                                            description: '$$st1.description',
                                            imageUrl: '$$st1.imageUrl',
                                            tests: {
                                                $map: {
                                                    input: {
                                                        $filter: {
                                                            input: '$tests',
                                                            as: 't',
                                                            cond: { $eq: ['$$t.subTopic1Id', '$$st1._id'] }
                                                        }
                                                    },
                                                    as: 't',
                                                    in: {
                                                        _id: '$$t._id',
                                                        testLevel: '$$t.testLevel',
                                                        questionType: '$$t.lmsQuestionType',
                                                        description: '$$t.description',
                                                        displayOrder: '$$t.displayOrder',
                                                        testTiming: '$$t.testTiming',
                                                        questions: {
                                                            $map: {
                                                                input: {
                                                                    $filter: {
                                                                        input: '$questions',
                                                                        as: 'q',
                                                                        cond: { $eq: ['$$q.testLevelId', '$$t._id'] }
                                                                    }
                                                                },
                                                                as: 'q',
                                                                in: {
                                                                    _id: '$$q._id',
                                                                    lmsQuestion: '$$q.lmsQuestion',
                                                                    lmsmcqImageUrl: '$$q.mcqImageUrl',
                                                                    lmsmcqProgramming: '$$q.mcqProgramming',
                                                                    displayOrder: '$$q.displayOrder',
                                                                    status: '$$q.status',
                                                                    options: {
                                                                        $filter: {
                                                                            input: '$options',
                                                                            as: 'opt',
                                                                            cond: { $eq: ['$$opt.questionId', '$$q._id'] }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            // 8. Final projection
            {
                $project: {
                    _id: 1,
                    topicName: 1,
                    topicSource: 1,
                    price: 1,
                    description: 1,
                    imageUrl: 1,
                    displayOrder: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    subTopics: 1
                }
            }
        ]).exec();
    }
    async update(id: string, updatedTopicDto: UpdateTopicsDto): Promise<Topics> {
        return this.topicsModel.findOneAndUpdate({ _id: id }, updatedTopicDto).exec();
    }

    async delete(id: string): Promise<Topics> {
        const deletedTopic = await this.topicsModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        // 2. Mark SubTopics
        await this.subTopicModel.updateMany(
            { topicId: id },
            { $set: { status: 'DELETED' } }
        );

        // 3. Mark SubTopics1
        await this.subTopic1Model.updateMany(
            { topicId: id },
            { $set: { status: 'DELETED' } }
        );

        // 4. Mark Tests
        await this.lmsTestModel.updateMany(
            { topicId: id },
            { $set: { status: 'DELETED' } }
        );

        // 5. Mark Questions
        await this.LmsQuestionModel.updateMany(
            { topicId: id },
            { $set: { status: 'DELETED' } }
        );

        // 6. Get the questions’ IDs and mark their options as DELETED
        const questionTopics = await this.LmsQuestionModel.find({ topicId: id }).lean();
        const questionIds = questionTopics.map(qt => qt._id);
        await this.lmsOptionModel.updateMany(
            { questionId: { $in: questionIds } },
            { $set: { status: 'DELETED' } }
        );
        return deletedTopic
    }
}