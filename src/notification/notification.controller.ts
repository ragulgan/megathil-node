import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AdminGuard, UserGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/base/controller';
import { NotificationDto } from './dto/notification.dto';
import { appConst, NotificationStatus } from '../libs/constants';
import * as _ from 'lodash';
import { verifyAndExtractToken } from 'src/utill/utill';
import { UpdateNotificationDto } from './dto/notificationUpdate.dto';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async sendPushNotification(@Body() notificationDto: NotificationDto, @Res() res: Response) {
    try {
      const notifationSent = await this.notificationService.sentPushNotification(notificationDto);
      if (notifationSent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5028' }, '5028');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.error('Error updating course:', e.message);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '500');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'viewed', enum: NotificationStatus, required: false, description: 'search based on view status' })
  @ApiQuery({ name: 'userId', required: false, description: 'search based on userId' })
  @ApiQuery({ name: 'firstName', required: false, description: 'search based on name' })
  @ApiQuery({ name: 'title', required: false, description: 'search based on title' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getAllNotification = await this.notificationService.findAllNotification(queryParams);
      if (!_.isEmpty(getAllNotification.NotificationList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getAllNotification.NotificationList,
          count: getAllNotification.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getAllNotification.count }, '1005')
      }
    } catch (e) {
      console.log("Error:", e);
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('userId')
  async listInterviewerAvailabilities(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getUserNotification = await this.notificationService.findUserNotification(queryParams, decodedToken.id);
      if (!_.isEmpty(getUserNotification.NotificationList)) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: getUserNotification.NotificationList,
        count: getUserNotification.count,
      }, '1004');
    } else {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getUserNotification.count }, '1005')
    }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedNotificationDto: UpdateNotificationDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateNotification = await this.notificationService.updateNotification(id, updatedNotificationDto, decodedToken.id);
      if (updateNotification) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5099',
          data: {
            _id: (updateNotification as any).id,
            updatedAt: (updateNotification as any).updatedAt,
          }
        }, '5099');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

}
