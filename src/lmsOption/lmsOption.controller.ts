import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { LmsOptionService } from './lmsOption.service';
import { CreateLMSOptionDto } from './dto/createLmsOption.dto';
import { UpdateLMSOptionDto } from './dto/updateLmsOption.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import * as _ from 'lodash';
const { ERROR, SUCCESS } = appConst;

@ApiTags('LMS Option')
@Controller('lms-option')
export class LmsOptionController {
    constructor(
        private readonly LmsOptionService: LmsOptionService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createLMSOptionDto: CreateLMSOptionDto, @Res() res: Response) {
        try {
            const createdLmsOption = await this.LmsOptionService.create(createLMSOptionDto);
            if (createdLmsOption) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1041',
                    data: {
                        _id: (createdLmsOption as any).id,
                        createdAt: (createdLmsOption as any).createdAt,
                    }
                }, '1041');
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
    @Get('minimal/:questionId')
    async findModulesByOptionId(@Param('questionId') questionId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getLmsOption = await this.LmsOptionService.findMinimalByOptionId(queryParams, questionId);
            if (!_.isEmpty(getLmsOption)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: { modules: getLmsOption.optionList, question: getLmsOption.question },
                    count: getLmsOption.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getLmsOption.optionList.length }, '1005')
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
            const getByLmsOption = await this.LmsOptionService.findById(id)
            if (!_.isEmpty(getByLmsOption)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByLmsOption
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
    async update(@Param('id') id: string, @Body() UpdateLmsOptionDto: UpdateLMSOptionDto, @Res() res: any) {
        try {
            const updateLmsOption = await this.LmsOptionService.update(id, UpdateLmsOptionDto);
            if (updateLmsOption) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1042',
                    data: {
                        _id: (updateLmsOption as any).id,
                        updatedAt: (updateLmsOption as any).updatedAt,
                    }
                }, '1042');
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
            const deletedOption = await this.LmsOptionService.delete(id);
            if (deletedOption) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1043', data: { _id: (deletedOption as any).id } }, '1043');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}