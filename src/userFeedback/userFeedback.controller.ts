import { Body, Controller, Post, Get, Request, Res, UseGuards, Query, BadRequestException, Param, Put, Delete } from '@nestjs/common';
import { UsersFeedbackService } from './userFeedback.service';
import { FeedBackDto } from './dto/userFeedBackCreate.dto';
import { UpdateFeedBackDto } from './dto/userFeedBackUpdate.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { UserGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { verifyAndExtractToken } from 'src/utill/utill';

@ApiTags('FeedBack')
@Controller('feedBacks')
export class UserFeedbackController {
  constructor(
    private readonly UserFeedbackService: UsersFeedbackService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() userRatingDto: FeedBackDto, @Request() req: any,  @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const createdUserRating = await this.UserFeedbackService.create(userRatingDto, decodedToken.id);
      if (createdUserRating) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5054',
          data: {
            _id: (createdUserRating as any).id,
            createdAt: (createdUserRating as any).createdAt,
          }
        }, '5054');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'ticket', required: false, description: 'search based on ticket no' })
  @ApiQuery({ name: 'title', required: false, description: 'search based on title' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getFeedback = await this.UserFeedbackService.findAll(queryParams);
      if (!_.isEmpty(getFeedback.FeedbackList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getFeedback.FeedbackList,
          count: getFeedback.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getFeedback.count }, '1005')
      }
    } catch (e) {
      console.log("Error:", e);
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getFeedbackById = await this.UserFeedbackService.findById(id)
      if (getFeedbackById) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getFeedbackById
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedFeedbackDto: UpdateFeedBackDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateFeedback = await this.UserFeedbackService.update(id, updatedFeedbackDto, decodedToken.id);
      if (updateFeedback) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5055',
          data: {
            _id: (updateFeedback as any).id,
            updatedAt: (updateFeedback as any).updatedAt,
          }
        }, '5055');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteFeedback = await this.UserFeedbackService.delete(id);
      if (deleteFeedback) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5056', data: { _id: (deleteFeedback as any).id } }, '5056');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
