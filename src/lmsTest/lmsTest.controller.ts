import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { LmsTestService } from './lmsTest.service';
import { CreateTestLevelDto } from './dto/createLmsTest.dto';
import { UpdateTestLevelDto } from './dto/updateLmsTest.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { verifyAndExtractToken } from '../utill/utill';
import * as _ from 'lodash';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Test Level')
@Controller('test-level')
export class TestLevelController {
    constructor(
        private readonly LmsTestService: LmsTestService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createTestLevelDto: CreateTestLevelDto, @Res() res: Response) {
        try {
            const createdSubTopic = await this.LmsTestService.create(createTestLevelDto);
            if (createdSubTopic) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5124',
                    data: {
                        _id: (createdSubTopic as any).id,
                        createdAt: (createdSubTopic as any).createdAt,
                    }
                }, '5124');
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
    @Get('minimal/:topicId/:subTopicId/:subTopic1Id')
    async findModulesByUnitId(@Param('topicId') topicId: string, @Param('subTopicId') subTopicId: string, @Param('subTopic1Id') subTopic1Id: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any,  @Request() req:any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const getSubTopic = await this.LmsTestService.findMinimalByTestLevelId(queryParams, topicId, subTopicId, subTopic1Id, decodedToken);
            if (!_.isEmpty(getSubTopic)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: { modules: getSubTopic.lmsTestList, topic: getSubTopic.topic, subTopic: getSubTopic.subTopic, subTopic1: getSubTopic.subTopic1 },
                    count: getSubTopic.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getSubTopic.lmsTestList.length }, '1005')
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
            const getBySubTopic = await this.LmsTestService.findById(id)
            if (!_.isEmpty(getBySubTopic)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getBySubTopic
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
    async update(@Param('id') id: string, @Body() UpdateTestLevelDto: UpdateTestLevelDto, @Res() res: any) {
        try {
            const updateSubTopic1 = await this.LmsTestService.update(id, UpdateTestLevelDto);
            if (updateSubTopic1) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5125',
                    data: {
                        _id: (updateSubTopic1 as any).id,
                        updatedAt: (updateSubTopic1 as any).updatedAt,
                    }
                }, '5125');
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
            const deletedSubTopic1 = await this.LmsTestService.delete(id);
            if (deletedSubTopic1) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5126', data: { _id: (deletedSubTopic1 as any).id } }, '5126');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}