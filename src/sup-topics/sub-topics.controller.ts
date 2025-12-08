import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { SubTopicService } from './sub-topics.service';
import { CreateSubTopicsDto } from './dto/createSubTopic.dto';
import { UpdateSubTopicsDto } from './dto/updateSubTopic.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as _ from 'lodash';
import { verifyAndExtractToken } from '../utill/utill';
const { ERROR, SUCCESS } = appConst;

@ApiTags('SubTopic')
@Controller('sup-topic')
export class SubTopicsController {
    constructor(
        private readonly SubTopicService: SubTopicService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createSubTopicsDto: CreateSubTopicsDto, @Res() res: Response) {
        try {
            const createdSubTopic = await this.SubTopicService.create(createSubTopicsDto);
            if (createdSubTopic) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5118',
                    data: {
                        _id: (createdSubTopic as any).id,
                        createdAt: (createdSubTopic as any).createdAt,
                    }
                }, '5118');
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
    @Get('minimal/:topicId')
    async findModulesByUnitId(@Param('topicId') topicId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const getSubTopic = await this.SubTopicService.findMinimalBySubTopicId(queryParams, topicId, decodedToken);
            if (!_.isEmpty(getSubTopic)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: { modules: getSubTopic.subTopicList, unit: getSubTopic.topic },
                    count: getSubTopic.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getSubTopic.subTopicList.length }, '1005')
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
            const getBySubTopic = await this.SubTopicService.findById(id)
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
    async update(@Param('id') id: string, @Body() UpdateSubTopicDto: UpdateSubTopicsDto, @Res() res: any) {
        try {
            const updateSubTopic = await this.SubTopicService.update(id, UpdateSubTopicDto);
            if (updateSubTopic) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5119',
                    data: {
                        _id: (updateSubTopic as any).id,
                        updatedAt: (updateSubTopic as any).updatedAt,
                    }
                }, '5119');
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
            const deletedSubTopic = await this.SubTopicService.delete(id);
            if (deletedSubTopic) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5120', data: { _id: (deletedSubTopic as any).id } }, '5120');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}