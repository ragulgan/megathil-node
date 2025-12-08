import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { LMSQustionsService } from './lmsQuestion.service';
import { CreateLMSQuestionDto } from './dto/createLmsQuestion.dto';
import { UpdateLMSQuestionDto } from './dto/updateLmsQuestion.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { verifyAndExtractToken } from '../utill/utill';
import * as _ from 'lodash';
const { ERROR, SUCCESS } = appConst;

@ApiTags('LMS Question')
@Controller('lms-question')
export class LmsQuestionController {
    constructor(
        private readonly LmsQuestionService: LMSQustionsService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createLMSQuestionDto: CreateLMSQuestionDto, @Res() res: Response) {
        try {
            const createdLmsQuestion = await this.LmsQuestionService.create(createLMSQuestionDto);
            if (createdLmsQuestion) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1020',
                    data: {
                        _id: (createdLmsQuestion as any).id,
                        createdAt: (createdLmsQuestion as any).createdAt,
                    }
                }, '1020');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @Get('minimal/:topicId/:subTopicId/:subTopic1Id/:testLevelId')
    async findModulesByUnitId(@Param('topicId') topicId: string, @Param('subTopicId') subTopicId: string, @Param('subTopic1Id') subTopic1Id: string, @Param('testLevelId') testLevelId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const getProgressStatus = await this.LmsQuestionService.getLMSProgressByTestIdAndUserId(decodedToken.id, testLevelId);
            if (getProgressStatus) {
                if (getProgressStatus.status == 'COMPLETED') {
                    this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                        code: '5128',
                        data: getProgressStatus
                    }, '5128');
                } else if (getProgressStatus.status == 'INCOMPLETED') {
                    await this.LmsQuestionService.deleteLMSProgressStatusWithHistory(getProgressStatus.id);
                }
            }
            const getLmsQustion = await this.LmsQuestionService.findMinimalByTestLevelId(queryParams, topicId, subTopicId, subTopic1Id, testLevelId, decodedToken);
            if (!_.isEmpty(getLmsQustion)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: { modules: getLmsQustion.lmsQuestionList, topic: getLmsQustion.topic, subTopic: getLmsQustion.subTopic, subTopic1: getLmsQustion.subTopic1, testLevel: getLmsQustion.testLevel },
                    count: getLmsQustion.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getLmsQustion.lmsQuestionList.length }, '1005')
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Request() req, @Res() res: any) {
        try {
            const getByLmsQuestion = await this.LmsQuestionService.findById(id)
            if (!_.isEmpty(getByLmsQuestion)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByLmsQuestion
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() UpdateLmsQuestionDto: UpdateLMSQuestionDto, @Res() res: any) {
        try {
            const updateLmsQuestion = await this.LmsQuestionService.update(id, UpdateLmsQuestionDto);
            if (updateLmsQuestion) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1021',
                    data: {
                        _id: (updateLmsQuestion as any).id,
                        updatedAt: (updateLmsQuestion as any).updatedAt,
                    }
                }, '1021');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async delete(@Param('id') id: string, @Res() res: any) {
        try {
            const deletedSubTopic1 = await this.LmsQuestionService.delete(id);
            if (deletedSubTopic1) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1022', data: { _id: (deletedSubTopic1 as any).id } }, '1022');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}