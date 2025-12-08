import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { LmsQuestionResponseService } from './lmsQuestionResponse.service';
import { CreateLMSQuestionResponseDto } from './dto/lmsQuestionResponse.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as _ from 'lodash';
import * as moment from 'moment';
import { verifyAndExtractToken } from '../utill/utill';
import { UpdateLMSQuestionResponseDto } from './dto/lmsQuestionResponseUpdate.dto';
const { ERROR, SUCCESS } = appConst;

@ApiTags('LMS Question Response')
@Controller('lms-question-response')
export class LmsQuestionResponseController {
    constructor(
        private readonly LmsQuestionResponseService: LmsQuestionResponseService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createLMSQuestionResponseDto: CreateLMSQuestionResponseDto, @Res() res: Response, @Request() req) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const createdLmsQuestionResponse = await this.LmsQuestionResponseService.create(createLMSQuestionResponseDto, decodedToken.id,);
            if (createdLmsQuestionResponse) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1047',
                    data: {
                        _id: (createdLmsQuestionResponse as any).progressId,
                        createdAt: (createdLmsQuestionResponse as any).createdAt,
                        optionValid: (createdLmsQuestionResponse as any).optionValid
                    }
                }, '1047');
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
    @Put()
    async update(@Body() updateLMSQuestionResponseDto: UpdateLMSQuestionResponseDto, @Res() res: Response, @Request() req) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const updateLMSQuestionResponse = await this.LmsQuestionResponseService.update(updateLMSQuestionResponseDto, decodedToken.id,);
            if (updateLMSQuestionResponse) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1047',
                    data: {
                        _id: (updateLMSQuestionResponse as any).progressId,
                        createdAt: (updateLMSQuestionResponse as any).createdAt,
                        optionValid: (updateLMSQuestionResponse as any).optionValid
                    }
                }, '1047');
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
    @Get()
    async get(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const history = await this.LmsQuestionResponseService.getUserHistoryWithProgress(userId);
            if (history) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: history,
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('latest-attend')
    async getLatestAttend(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const history = await this.LmsQuestionResponseService.getUserHistoryWithLastTestAttendProgress(userId);
            if (history) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: history,
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('completedTestInfo')
    async getCompletedTestInfo(@Query('userId') userId: string, @Query('testLevelId') testLevelId: string, @Res() res: Response) {
        try {
            const history = await this.LmsQuestionResponseService.getUserHistoryWithCompletedTestProgress(userId, testLevelId);
            if (history) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: history,
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'fromDate', required: false, description: 'Return Based on fromDate' })
    @ApiQuery({ name: 'toDate', required: false, description: 'Return Based on toDate' })
    @Get('reports/:collegeId/:departmentId/:topicId/:subTopicId/:subTopic1Id/:testLevelId')
    async getUserProgress(@Param('collegeId') collegeId: string, @Param('departmentId') departmentId: string, @Param('topicId') topicId: string, @Param('subTopicId') subTopicId: string, @Param('subTopic1Id') subTopic1Id: string, @Param('testLevelId') testLevelId: string, @Query() queryParams: { limit?: number; skip?: number; fromDate?: string; toDate?: string }, @Res() res: any, @Request() req) {
        try {
            const history = await this.LmsQuestionResponseService.getUserProgressDetails(collegeId, departmentId, topicId, subTopicId, subTopic1Id, testLevelId, queryParams);
            if (history) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: history,
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'fromDate', required: false, description: 'Return Based on fromDate' })
    @ApiQuery({ name: 'toDate', required: false, description: 'Return Based on toDate' })
    @Get('reports-export/:collegeId/:departmentId/:topicId/:subTopicId/:subTopic1Id/:testLevelId')
    async getUserProgressExport(@Param('collegeId') collegeId: string, @Param('departmentId') departmentId: string, @Param('topicId') topicId: string, @Param('subTopicId') subTopicId: string, @Param('subTopic1Id') subTopic1Id: string, @Param('testLevelId') testLevelId: string, @Query() queryParams: { limit?: number; skip?: number; fromDate?: string; toDate?: string }, @Res() res: any, @Request() req) {
        try {
            const history = await this.LmsQuestionResponseService.getUserProgressDetails(collegeId, departmentId, topicId, subTopicId, subTopic1Id, testLevelId, queryParams);
            if (history) {
                const transformedData = this.transformLmsProgressData(history);
                const excelBuffer = this.LmsQuestionResponseService.convertJsonToExcel(transformedData);
                const filename = `lms_user_report_${moment().format("DDMMMyyyy")}.xlsx`;
                res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.send(excelBuffer);
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    private transformLmsProgressData(data: any[]) {
        return data.map((item, index) => {
            return {
            SNo: index + 1,
            StudentName: `${item.firstName || ''} ${item.lastName || ''}`,
            Email: item.email || '',
            LmsSource: item.lmsSource === 'LMS_ADMIN' ? 'COLLEGE' : item.lmsSource === 'LMS_WEB' ? 'GENERAL' : '',
            College: item.collegeName || '',
            Department: item.departmentName || '',
            Topic: item.topicName || '',
            SubTopic: item.subTopicName || '',
            SubTopic1: item.subTopic1Name || '',
            Test: item.testLevelName || '',
            Status: item.progressStatus || '',
            CreatedAt: item.createdAt
                ? moment(item.createdAt).utcOffset(330).format('DD-MMM-YYYY HH:mm')
                : '',
            CorrectAnswers: item.correctQuestionCount || 0,
            WrongAnswers: item.wrongQuestionCount || 0,
            Percentage: item.testPercertage ? `${item.testPercertage}%` : '0%',
            TotalQuestions: item.totalQuestion || 0,
            TotalTimeTaken: item.totalTimeTaken || 0,
            AverageTime: item.averageTimeTaken || 0,
            TestStart: item.testStartTime
                ? moment(item.testStartTime).utcOffset(330).format('DD-MMM-YYYY HH:mm')
                : '',
            TestEnd: item.testEndTime
                ? moment(item.testEndTime).utcOffset(330).format('DD-MMM-YYYY HH:mm')
                : '',
            Duration: item.testDuration
                ? `${Math.floor(item.testDuration / 1000)} sec`
                : '',
            };
        });
    }
}
