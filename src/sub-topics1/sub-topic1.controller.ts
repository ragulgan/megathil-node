import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { SubTopic1Service } from './sub-topic1.service';
import { CreateSubTopics1Dto } from './dto/createSubTopic1.dto';
import { UpdateSubTopics1Dto } from './dto/updateSubTopic1.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as _ from 'lodash';
import { verifyAndExtractToken } from '../utill/utill';
const { ERROR, SUCCESS } = appConst;

@ApiTags('SubTopic1')
@Controller('sup-topic1')
export class SubTopics1Controller {
    constructor(
        private readonly SubTopic1Service: SubTopic1Service,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createSubTopics1Dto: CreateSubTopics1Dto, @Res() res: Response) {
        try {
            const createdSubTopic = await this.SubTopic1Service.create(createSubTopics1Dto);
            if (createdSubTopic) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5121',
                    data: {
                        _id: (createdSubTopic as any).id,
                        createdAt: (createdSubTopic as any).createdAt,
                    }
                }, '5121');
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
    @Get('minimal/:topicId/:subTopicId')
    async findModulesByUnitId(@Param('topicId') topicId: string, @Param('subTopicId') subTopicId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const getSubTopic = await this.SubTopic1Service.findMinimalBySubTopic1Id(queryParams, topicId, subTopicId, decodedToken);
            if (!_.isEmpty(getSubTopic)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: { modules: getSubTopic.subTopic1List, topic: getSubTopic.topic, subTopic: getSubTopic.subTopic },
                    count: getSubTopic.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getSubTopic.subTopic1List.length }, '1005')
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
            const getBySubTopic = await this.SubTopic1Service.findById(id)
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
    async update(@Param('id') id: string, @Body() UpdateSubTopic1Dto: UpdateSubTopics1Dto, @Res() res: any) {
        try {
            const updateSubTopic1 = await this.SubTopic1Service.update(id, UpdateSubTopic1Dto);
            if (updateSubTopic1) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5122',
                    data: {
                        _id: (updateSubTopic1 as any).id,
                        updatedAt: (updateSubTopic1 as any).updatedAt,
                    }
                }, '5122');
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
            const deletedSubTopic1 = await this.SubTopic1Service.delete(id);
            if (deletedSubTopic1) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5123', data: { _id: (deletedSubTopic1 as any).id } }, '5123');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}