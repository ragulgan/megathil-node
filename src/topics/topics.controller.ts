import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicsDto } from './dto/createTopics.dto';
import { UpdateTopicsDto } from './dto/updateTopics.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { verifyAndExtractToken } from '../utill/utill';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Topic')
@Controller('topic')
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createTopicsDto: CreateTopicsDto, @Res() res: Response) {
    try {
      const createdTopics = await this.topicsService.create(createTopicsDto);
      if (createdTopics) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5115',
          data: {
            _id: (createdTopics as any).id,
            createdAt: (createdTopics as any).createdAt,
          }
        }, '5115');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'topicName', required: false, description: 'Return Based on topic Name' })
  @ApiQuery({ name: 'topicSource', required: false, description: 'Return Based on topic Source' })
  @ApiQuery({ name: 'userId', required: false, description: 'Return Based on User id' })
  @Get()
  async findAll(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getTopics = await this.topicsService.findAll(queryParams, decodedToken);
      if (getTopics) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getTopics.topicList,
          count: getTopics.count
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
  @Get('hierarchy')
  async get(@Query('topicId') topicId: string, @Res() res: Response) {
    try {
      const history = await this.topicsService.getTopicHierarchy(topicId);
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
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByTopic = await this.topicsService.findById(id)
      if (getByTopic) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByTopic
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
  async update(@Param('id') id: string, @Body() updatedTopicDto: UpdateTopicsDto, @Res() res: any) {
    try {
      const updateTopic = await this.topicsService.update(id, updatedTopicDto);
      if (updateTopic) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5116',
          data: {
            _id: (updateTopic as any).id,
            updatedAt: (updateTopic as any).updatedAt,
          }
        }, '5116');
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
      const deleteTopic = await this.topicsService.delete(id);
      if (deleteTopic) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5117', data: { _id: (deleteTopic as any).id } }, '5117');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }
}