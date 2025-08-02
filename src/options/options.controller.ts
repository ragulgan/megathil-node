import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { OptionsService } from './options.service';
import { CreateOptionsDto } from './dto/createOptions .dto';
import { UpdatedOptionsDto } from './dto/updateOptions .dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Options } from './options.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import { QuestionService } from '../question/question.service';
import _ from 'lodash';


@ApiTags('Options')
@Controller('options')
export class OptionsController {
  constructor(
    private readonly OptionsService: OptionsService,
    private readonly responseService: ResponseService,
    private readonly questionService: QuestionService,
    @InjectModel(Options.name) private OptionsModel: Model<Options>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createOptionsDto: CreateOptionsDto, @Res() res: Response) {
    try {
      const isValid = await this.questionService.gethasMultiAnswers(createOptionsDto.questionId);
      if (isValid && isValid.hasMultiAnswers === false) {
        const isValidOption = await this.OptionsService.findAllOptionsForQuestionId('', createOptionsDto.questionId);
        const validOptionsCount = isValidOption.options.filter(option => option.validOption === 'true').length;
        if (validOptionsCount >= 1 && createOptionsDto.validOption === 'true') {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5010' }, '5010');
          return;
        }
      }
      const createdOptions = await this.OptionsService.create(createOptionsDto);
      if (createdOptions) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1041',
          data: {
            _id: (createdOptions as any).id,
            createdAt: (createdOptions as any).createdAt,
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
  @ApiQuery({ name: 'optionText', required: false, description: 'Return Based on optionText' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getOptions = await this.OptionsService.findAll(queryParams);
      if (getOptions) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getOptions.OptionsList,
          count: getOptions.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getOptions.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('byquestion/:questionId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'optionText', required: false, description: 'Return Based on optionText' })
  async findOptionsByQuestionId(@Query() queryParams: any, @Param('questionId') questionId: string, @Res() res: any) {
    try {
      const { options, question, count } = await this.OptionsService.findAllOptionsForQuestionId(queryParams, questionId);
      if (options) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: {
            options: options,
            question: question
          },
          count: count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: 0 }, '1005')
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
      const getByStudent = await this.OptionsService.findById(id)
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
  async update(@Param('id') id: string, @Body() updatedOptionsDto: UpdatedOptionsDto, @Res() res: any) {
    try {
      const isValid = await this.questionService.gethasMultiAnswers(updatedOptionsDto.questionId);
      if (isValid && isValid.hasMultiAnswers === false) {
        const existingOption = await this.OptionsService.findById(id);
        if (existingOption.validOption === 'false' && updatedOptionsDto.validOption === 'true') {
          const isValidOption = await this.OptionsService.findAllOptionsForQuestionId('', updatedOptionsDto.questionId);
          const validOptionsCount = isValidOption.options.filter(option => option.validOption === 'true' && option.id !== id).length;
          if (validOptionsCount >= 1) {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5010' }, '5010');
            return;
          }
        }
      }
      const updateStudent = await this.OptionsService.update(id, updatedOptionsDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1042',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
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
      const deleteOptions = await this.OptionsService.delete(id);
      if (deleteOptions) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1043', data: { _id: (deleteOptions as any).id } }, '1043');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
