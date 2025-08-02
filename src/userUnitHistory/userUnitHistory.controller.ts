import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { userUnitHistoryService } from './userUnitHistory.service';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, UserStaffAdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;


@ApiTags('userUnitHistory')
@Controller('userUnitHistory')
export class userUnitHistoryController {
  constructor(
    private readonly userUnitHistoryService: userUnitHistoryService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getuserUnitHistory = await this.userUnitHistoryService.findAll(queryParams);
      if (getuserUnitHistory) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getuserUnitHistory.userUnitHistoryList,
          count: getuserUnitHistory.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get("user/:userId")
  async getUserEvaluationHistory(@Param('userId') userId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getuserUnitHistory = await this.userUnitHistoryService.findUserUnitHistory(userId, queryParams);
      if (getuserUnitHistory) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getuserUnitHistory.userUnitHistoryList,
          count: getuserUnitHistory.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
