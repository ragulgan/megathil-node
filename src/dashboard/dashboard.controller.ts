import { Controller, Get, Res, BadRequestException, UseGuards, Query, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst, Dashboard_Filter } from '../libs/constants';
import {  AdminGuard, StaffGuard } from 'src/auth/jwt-auth.guard';
import { verifyAndExtractToken } from 'src/utill/utill';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { GemsService } from 'src/gems/gems.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get()
  @ApiQuery({ name: 'collegeUsage', enum: Dashboard_Filter, required: false, description: 'Return Based on collegeUsage' })
  @ApiQuery({ name: 'studentEngagement', enum: Dashboard_Filter, required: false, description: 'Return Based on studentEngagement' })
  @ApiQuery({ name: 'gemPurchase', enum: Dashboard_Filter, required: false, description: 'Return Based on gemPurchase' })
  @ApiQuery({ name: 'collegeUsageEndDate', required:false, description: 'Return Based on end date 2025-03-21T23:59:59Z'})
  @ApiQuery({ name: 'collegeUsageStartDate', required:false, description: 'Return Based on start date 2025-01-18T00:00:00Z'})
  @ApiQuery({ name: 'studentEngagementEndDate', required:false, description: 'Return Based on end date 2025-03-21T23:59:59Z'})
  @ApiQuery({ name: 'studentEngagementStartDate', required:false, description: 'Return Based on start date 2025-01-18T00:00:00Z'})
  @ApiQuery({ name: 'endDate', required:false, description: 'Return Based on end date 2025-03-21T23:59:59Z'})
  @ApiQuery({ name: 'startDate', required:false, description: 'Return Based on start date 2025-01-18T00:00:00Z'})
  async getUsersStatistics(@Res() res: Response, @Query() queryParams: { gemPurchase?: typeof Dashboard_Filter; studentEngagement?: typeof Dashboard_Filter; collegeUsage?: typeof Dashboard_Filter;
  } = {}) {
    try {
      const userData = await this.dashboardService.getUserStatistics(queryParams);
      if (userData) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: userData
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffGuard)
  @ApiBearerAuth()
  @Get('staffLogin')
  @ApiQuery({ name: 'collegeUsage', enum: Dashboard_Filter, required: false, description: 'Return Based on collegeUsage' })
  @ApiQuery({ name: 'studentEngagement', enum: Dashboard_Filter, required: false, description: 'Return Based on studentEngagement' })
  @ApiQuery({ name: 'gemPurchase', enum: Dashboard_Filter, required: false, description: 'Return Based on gemPurchase' })
  @ApiQuery({ name: 'studentEngagementEndDate', required:false, description: 'Return Based on end date 2025-03-21T23:59:59Z'})
  @ApiQuery({ name: 'studentEngagementStartDate', required:false, description: 'Return Based on start date 2025-01-18T00:00:00Z'})
  async getUserStatisticsStaffLogin(@Request() req, @Res() res: Response, @Query() queryParams: { gemPurchase?: typeof Dashboard_Filter; studentEngagement?: typeof Dashboard_Filter; collegeUsage?: typeof Dashboard_Filter;
  } = {}) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const userData = await this.dashboardService.getUserStatisticsStaffLogin(queryParams, decodedToken.id);
      if (userData) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: userData
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }


  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('gems')
  async getGemsStatistics(@Res() res: Response) {
    try {
      const gemsData = await this.dashboardService.getGemsStatistics();
      if (gemsData) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: gemsData
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

}
