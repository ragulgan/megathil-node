import { Model } from 'mongoose';
import { Injectable, Module } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LmsOption } from './lmsOption.schema';
import { CreateLMSOptionDto } from './dto/createLmsOption.dto';
import { UpdateLMSOptionDto } from './dto/updateLmsOption.dto';
import * as _ from 'lodash';
import { LmsQuestion } from 'src/lmsQuestion/lmsQuestion.schema';
const mongoose = require('mongoose');

@Injectable()
export class LmsOptionService {
    constructor(
        @InjectModel(LmsQuestion.name) private lmsQuestionModel: Model<LmsQuestion>,
        @InjectModel(LmsOption.name) private lmsOptionModel: Model<LmsOption>,
    ) { }

    async create(createLMSOptionDto: CreateLMSOptionDto): Promise<LmsOption> {
        try {
            const createdSubTopic = new this.lmsOptionModel(createLMSOptionDto);
            const data = await createdSubTopic.save();
            await this.lmsOptionModel.findOneAndUpdate({ _id: data._id }, { lmsOptionId: data._id }).exec();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Module.");
        }
    }

    async findMinimalByOptionId(queryParams: any, questionId: string) {
        const parsedPage = parseInt(String(queryParams.page), 10) || 1;
        const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
        const skipValue = (parsedPage - 1) * parsedLimit;
        const ObjectId = mongoose.Types.ObjectId;
        const questionObjectId = new ObjectId(questionId);
        const match: any = { status: 'ACTIVE', questionId: questionObjectId };
        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const optionList = await this.lmsOptionModel.aggregate([
            { $match: match },
            { $skip: skipValue },
            { $limit: parsedLimit },
            {
                $lookup: {
                    from: 'lmsquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'questionId',
                },
            },
            { $unwind: { path: '$questionId', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    lmsOptionId: '$_id',
                    lmsOption: 1,
                    validOption: 1,
                    explanation: 1,
                    displayOrder: 1,
                    status: 1,
                    essayAnswer: 1,
                    question: {
                        id: '$questionId._id',
                        lmsQuestion: '$questionId.lmsQuestion',
                        mcqImageUrl: '$questionId.mcqImageUrl',
                        mcqProgramming: '$questionId.mcqProgramming',
                    },
                },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);
        const count = await this.lmsOptionModel.countDocuments(match).exec();
        const question = await this.lmsQuestionModel.findOne({ _id: questionId }).select("questionlId lmsQuestion status mcqImageUrl mcqProgramming");
        return { optionList, count, question }
    }

    async findById(id: string): Promise<LmsOption> {
        return await this.lmsOptionModel.findOne({ _id: id })
            .populate('questionId', 'id lmsQuestion status mcqImageUrl mcqProgramming')
    }

    async update(id: string, UpdateLMSOptionDto: UpdateLMSOptionDto): Promise<LmsOption> {
        return this.lmsOptionModel.findOneAndUpdate({ _id: id }, UpdateLMSOptionDto).exec();
    }

    async delete(id: string): Promise<LmsOption> {
        const deletedLmsOption = await this.lmsOptionModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedLmsOption
    }

}