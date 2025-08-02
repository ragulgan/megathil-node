import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/createquestion.dto';
import { UpdatedQuestionDto } from './dto/updateQuestion.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from './question.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { verifyAndExtractToken } from 'src/utill/utill';


@ApiTags('Question')
@Controller('question')
export class QuestionController {
  constructor(
    private readonly QuestionService: QuestionService,
    private readonly responseService: ResponseService,
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto, @Res() res: Response) {
    try {
      const createdQuestion = await this.QuestionService.create(createQuestionDto);
      if (createdQuestion) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1020',
          data: {
            _id: (createdQuestion as any).id,
            createdAt: (createdQuestion as any).createdAt,
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
  @ApiQuery({ name: 'questionType', required: false, description: 'Return Based on QuestionType' })
  @ApiQuery({ name: 'questionTitle', required: false, description: 'Return Based on QuestionTitle' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getQuestion = await this.QuestionService.findAll(queryParams);
      if (getQuestion) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getQuestion.QuestionList,
          count: getQuestion.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'parentOptionId', required: false, description: 'Pass this for subquestions' })
  @Get('module/:moduleId')
  async findModuleQuestions(@Param('moduleId') moduleId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const getQuestion = await this.QuestionService.findAllByModule(queryParams, moduleId, decodedToken);
      if (getQuestion) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getQuestion.QuestionList,
          count: getQuestion.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch (error) {
      console.log("Error##", error);
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'questionType', required: false, description: 'Return Based on QuestionType' })
  @ApiQuery({ name: 'questionTitle', required: false, description: 'Return Based on QuestionTitle' })
  @Get('/bymodule/:moduleId')
  async findAllByModuleId(@Param('moduleId') moduleId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getQuestion = await this.QuestionService.findAllQuestionsByModuleId(queryParams, moduleId);
      if (getQuestion) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: { questions: getQuestion.questionsList, module: getQuestion.module },
          count: getQuestion.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('details/:id')
  async getDetailsId(@Param('id') id: string, @Res() res: any, @Request() req) {
    try {
      const details = await this.QuestionService.findByIdQuestionDetail(id);
      if (details) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: details
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.log("Error:", e);
      throw new BadRequestException();
    }
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByQuestion = await this.QuestionService.findById(id)
      if (!_.isEmpty(getByQuestion)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByQuestion
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
  async update(@Param('id') id: string, @Body() updatedQuestionDto: UpdatedQuestionDto, @Res() res: any) {
    try {
      const updateStudent = await this.QuestionService.update(id, updatedQuestionDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1021',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
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
      const deleteQuestion = await this.QuestionService.delete(id);
      if (deleteQuestion) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1022', data: { _id: (deleteQuestion as any).id } }, '1022');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
