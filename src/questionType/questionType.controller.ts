import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { QuestionTypeService } from './questionType.service';
import { CreateQuestionTypeDto } from './dto/createQuestionType.dto';
import { UpdatedQuestionTypeDto } from './dto/updateQuestionType.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionType } from './questionType.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';

@ApiTags('QuestionType')
@Controller('questionType')
export class QuestionTypeController {
  constructor(
    private readonly QuestionTypeService: QuestionTypeService,
    private readonly responseService: ResponseService,
    @InjectModel(QuestionType.name) private QuestionTypeModel: Model<QuestionType>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createQuestionTypeDto: CreateQuestionTypeDto, @Res() res: Response) {
    try {
      const exist = await this.QuestionTypeService.findByDisplayName(createQuestionTypeDto.displayName, createQuestionTypeDto.displayValue);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1135' }, '1135');
        return;
      }
      const createdQuestionType = await this.QuestionTypeService.create(createQuestionTypeDto);
      if (createdQuestionType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1035',
          data: {
            _id: (createdQuestionType as any).id,
            createdAt: (createdQuestionType as any).createdAt,
          }
        }, '1035');
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
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getQuestionType = await this.QuestionTypeService.findAll(queryParams);
      if (!_.isEmpty(getQuestionType)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getQuestionType.QuestionTypeList,
          count: getQuestionType.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getQuestionType.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.QuestionTypeService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedQuestionTypeDto: UpdatedQuestionTypeDto, @Res() res: any) {
    try {
      const exist = await this.QuestionTypeService.findByDisplayNameButId(updatedQuestionTypeDto.displayName, updatedQuestionTypeDto.displayValue, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1135' }, '1135');
        return;
      }
      const updateStudent = await this.QuestionTypeService.update(id, updatedQuestionTypeDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1036',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1036');
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
      const deleteQuestionType = await this.QuestionTypeService.delete(id);
      if (deleteQuestionType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1037', data: { _id: (deleteQuestionType as any).id } }, '1037');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
