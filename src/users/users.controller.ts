import { Body, Controller, Get, Post, Query, Res, Request, BadRequestException, Param, Put, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { BulkUploadFileDto, CreateUserDto } from '../users/dto/createuser.dto';
import { UpdatedUserDto } from '../users/dto/updateuser.dto ';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { StaffAdminGuard, UserStaffAdminGuard, UserAdminGuard, UserGuard, AdminGuard, InterviewerGuard, SuperAdminGuard, JwtAuthGuard, StaffGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { decodeTokenForPayment, getErrorCode, validateDOB, verifyAndExtractToken } from 'src/utill/utill';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../multer.config';
import { UserAwardGemsDto } from './dto/userAwardGems.dto';
import { GemsService } from 'src/gems/gems.service';
import { PaymentDto } from './dto/payment.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import mongoose from 'mongoose';
import * as fs from 'fs';
import { Response } from 'express'; // Make sure to import this

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
    private readonly gemsService: GemsService,
  ) { }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'userType', required: false, description: 'Return Based on user type BASIC/PREMIUM' })
  @ApiQuery({ name: 'status', required: false, description: 'Filters by source ACTIVE/INACTIVE' })
  @ApiQuery({ name: 'source', required: false, description: 'Filters by source MOBILE/WEB.' })
  @ApiQuery({ name: 'staffId', required: false, description: 'Filters by staff using staff id.', type: [String] })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.', type: [String] })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @Get('reports')
  async getUserReport(@Query() queryParams: any, @Res() res: any) {
    try {
      const result = await this.usersService.getUserReports(queryParams);

      // console.log("result", result)

      // following line is used to test the json format
      // this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: "200", data: result }, "200");

      // if (result) {
      //   this.responseService.sendResponse({}, res, SUCCESS.CODE, {
      //     code: '1002',
      //     data: result
      //   }, '1002');
      // }

      // following is the actual response to download xlsx file
      if(_.isEmpty(result)){
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
      const excelBuffer = this.usersService.convertJsonToExcel(result);
      const filename = `report_${moment().format("DDMMMyyyy")}.xlsx`;
      res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);
    } catch (e) {
      console.log("Error#", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'userType', required: false, description: 'Return Based on user type BASIC/PREMIUM' })
  @ApiQuery({ name: 'status', required: false, description: 'Filters by source ACTIVE/INACTIVE' })
  @ApiQuery({ name: 'source', required: false, description: 'Filters by source MOBILE/WEB.' })
  @ApiQuery({ name: 'staffId', required: false, description: 'Filters by staff using staff id.', type: [String] })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.', type: [String] })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @Get('generalreports')
  async getUserGeneralReport(@Query() queryParams: any, @Res() res: any) {
    try {
      const result = await this.usersService.getUserGeneralReports(queryParams);

      // console.log("result", result)

      // following line is used to test the json format
      // this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: "200", data: result }, "200");

      // if (result) {
      //   this.responseService.sendResponse({}, res, SUCCESS.CODE, {
      //     code: '1002',
      //     data: result
      //   }, '1002');
      // }

      // following is the actual response to download xlsx file
      if(_.isEmpty(result)){
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
      const excelBuffer = this.usersService.convertJsonToExcel(result);
      const filename = `report_${moment().format("DDMMMyyyy")}.xlsx`;
      res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);
    } catch (e) {
      console.log("Error#", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req, @Res() res: any) {
    try {
      const existingUser = await this.usersService.findUserForExistance(createUserDto);
      if (existingUser) {
        const code = getErrorCode(existingUser, createUserDto);
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: code }, code);
      }

      if (!validateDOB(createUserDto.dob)) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4304' }, '4304');
      }

      if (createUserDto.userType === 'PREMIUM') {
        const college = await this.usersService.findCollegeById(createUserDto.college);
        if (!college) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5012' }, '5012');
        }
        if (college.premiumUserAlloted < 1) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5011' }, '5011');
        }
      }

      const decodedToken = verifyAndExtractToken(req.headers);
      const createdUser = await this.usersService.create(createUserDto, decodedToken.id, decodedToken.role);
      if (createdUser) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1002',
          data: {
            _id: (createdUser as any).id,
            createdAt: (createdUser as any).createdAt,
          }
        }, '1002');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.log("User create error:", e);
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getUserProfile(@Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getUserProfile = await this.usersService.findUserProfileById(decodedToken.id);
      if (getUserProfile) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUserProfile
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005' }, '1005');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get('dayStreaks')
  async getUserDayStreaks(@Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getUserDayStreaks = await this.usersService.getUserDayStreaks(decodedToken.id);
      if (getUserDayStreaks) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUserDayStreaks
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005' }, '1005');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'userId', required: false, })
  @Get('userAchievements')
  async getUserAchievement(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      if (decodedToken.role === 'USER') {
        queryParams["userId"] = decodedToken.id;
      }
      const getUserAchievement = await this.usersService.findUserAchievement(queryParams);
      if (getUserAchievement) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUserAchievement.data,
          count: getUserAchievement.data.length
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Put('profile')
  async userProfileUpdate(@Body() updatedUserDto: UpdatedUserDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const existingUser = await this.usersService.findUserForExistanceButId(decodedToken.id, updatedUserDto);
      if (existingUser) {
        let code = '1048'; // error code for duplicate email
        if (existingUser.mobileNumber === updatedUserDto.mobileNumber) {
          code = '1149'; // error code for duplicate mobile number
        } else if (existingUser.studentId === updatedUserDto.studentId) {
          code = '1150';
        }
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: code }, code);
        return;
      }

      if (updatedUserDto.dob && !validateDOB(updatedUserDto.dob)) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: "4304" }, "4304");
      }

      if (updatedUserDto.appliedReferralCode) {
        const userData = await this.usersService.findUserById(decodedToken.id);

        if (userData?.appliedReferralCode) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: "5047" }, "5047");
        }

        if (updatedUserDto.appliedReferralCode === userData?.appliedReferralCode) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: "5048" }, "5048");
        }

        const refferedUser = await this.usersService.findUserByReferralCode(updatedUserDto.appliedReferralCode);
        if (!refferedUser) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: "5049" }, "5049");
        }
      }

      const updateUser = await this.usersService.updateUserModel(decodedToken.id, updatedUserDto);
      if (!_.isEmpty(updateUser)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1006',
          data: {
            _id: (updateUser as any).id,
            updatedAt: (updateUser as any).updatedAt,
          }
        }, '1006');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '1005' }, '1005');
      }
    } catch (e) {
      console.log('e====>', e)
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get('test-twilio')
  async testTwilio() {
    await this.usersService.testTwilio();
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'sort', required: false, })
  @ApiQuery({ name: 'isLmsUser', required: false, description: 'Filter by LMS User (true/false)' })
  @ApiQuery({ name: 'userType', required: false, description: 'Return Based on user type' })
  @ApiQuery({ name: 'promotedBy', required: false, description: 'Return Based on promoted code' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'graduatedDateTo', required: false, description: 'Taken as date where user graduated date at to.' })
  @ApiQuery({ name: 'graduatedDateFrom', required: false, description: 'Taken as date where user graduated date at from.' })
  @ApiQuery({ name: 'registerdDateTo', required: false, description: 'Taken as date where user resistered to.' })
  @ApiQuery({ name: 'registerdDateFrom', required: false, description: 'Taken as date where user resistered from.' })
  @ApiQuery({ name: 'staffId', required: false, description: 'Filters by staff.' })
  @ApiQuery({ name: 'cityId', required: false, description: 'Filters by city using city id.' })
  @ApiQuery({ name: 'stateId', required: false, description: 'Filters by state using state id.' })
  @ApiQuery({ name: 'countryId', required: false, description: 'Filters by country using country id.' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender [MALE,FEMALE or OTHERS]' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.', type: [String] })
  @ApiQuery({ name: 'education', required: false, description: 'Return Based on education' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Request() req, @Res() res: any) {
    try {
      const getUser = await this.usersService.findAll(queryParams);
      if (!_.isEmpty(getUser.userList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUser.userList,
          count: getUser.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getUser.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'sort', required: false, })
  @ApiQuery({ name: 'lmsSource', required: false, description: 'Return Based on lms user source LMS_ADMIN/LMS_WEB' })
  @ApiQuery({ name: 'lmsUserType', required: false, description: 'Return Based on lms user type BASIC/PREMIUM' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.', type: [String] })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get('lmsMainAdmin/users')
  async findAllLMSUser(@Query() queryParams: { limit?: number; skip?: number }, @Request() req, @Res() res: any) {
    try {
      const getUser = await this.usersService.findAllLmsUsers(queryParams);
      if (!_.isEmpty(getUser.userList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUser.userList,
          count: getUser.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getUser.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'sort', required: false, })
  @ApiQuery({ name: 'lmsSource', required: false, description: 'Return Based on lms source LMS_ADMIN/LMS_WEB' })
  @ApiQuery({ name: 'lmsUserType', required: false, description: 'Return Based on lms user type BASIC/PREMIUM' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.', type: [String] })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get('staffLogin/lms/user')
  async findAllStaffLoginLmsUsers(@Query() queryParams: { limit?: number; skip?: number }, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getUser = await this.usersService.findAllStaffLoginLmsUser(queryParams, decodedToken.id);
      if (!_.isEmpty(getUser.userList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUser.userList,
          count: getUser.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getUser.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'sort', required: false, })
  @ApiQuery({ name: 'isLmsUser', required: false, description: 'Filter by LMS User (true/false)' })
  @ApiQuery({ name: 'source', required: false, description: 'Return Based on source WEB/MOBILE' })
  @ApiQuery({ name: 'userType', required: false, description: 'Return Based on user type' })
  @ApiQuery({ name: 'promotedBy', required: false, description: 'Return Based on promoted code' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'graduatedDateTo', required: false, description: 'Taken as date where user graduated date at to.' })
  @ApiQuery({ name: 'graduatedDateFrom', required: false, description: 'Taken as date where user graduated date at from.' })
  @ApiQuery({ name: 'registerdDateTo', required: false, description: 'Taken as date where user resistered to.' })
  @ApiQuery({ name: 'registerdDateFrom', required: false, description: 'Taken as date where user resistered from.' })
  @ApiQuery({ name: 'staffId', required: false, description: 'Filters by staff.' })
  @ApiQuery({ name: 'cityId', required: false, description: 'Filters by city using city id.' })
  @ApiQuery({ name: 'stateId', required: false, description: 'Filters by state using state id.' })
  @ApiQuery({ name: 'countryId', required: false, description: 'Filters by country using country id.' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender [MALE,FEMALE or OTHERS]' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.', type: [String] })
  @ApiQuery({ name: 'education', required: false, description: 'Return Based on education' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get('staffLogin/college/webuser')
  async findAllUnderCollegeInsiteUser(@Query() queryParams: { limit?: number; skip?: number }, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getUser = await this.usersService.findAllUserUnderCollegeInsite(queryParams, decodedToken.id);
      if (!_.isEmpty(getUser.userList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUser.userList,
          count: getUser.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getUser.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'sort', required: false, })
  @ApiQuery({ name: 'isLmsUser', required: false, description: 'Filter by LMS User (true/false)' })
  @ApiQuery({ name: 'source', required: false, description: 'Return Based on source WEB/MOBILE' })
  @ApiQuery({ name: 'userType', required: false, description: 'Return Based on user type' })
  @ApiQuery({ name: 'promotedBy', required: false, description: 'Return Based on promoted code' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'graduatedDateTo', required: false, description: 'Taken as date where user graduated date at to.' })
  @ApiQuery({ name: 'graduatedDateFrom', required: false, description: 'Taken as date where user graduated date at from.' })
  @ApiQuery({ name: 'registerdDateTo', required: false, description: 'Taken as date where user resistered to.' })
  @ApiQuery({ name: 'registerdDateFrom', required: false, description: 'Taken as date where user resistered from.' })
  @ApiQuery({ name: 'staffId', required: false, description: 'Filters by staff.' })
  @ApiQuery({ name: 'cityId', required: false, description: 'Filters by city using city id.' })
  @ApiQuery({ name: 'stateId', required: false, description: 'Filters by state using state id.' })
  @ApiQuery({ name: 'countryId', required: false, description: 'Filters by country using country id.' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender [MALE,FEMALE or OTHERS]' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.', type: [String] })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.', type: [String] })
  @ApiQuery({ name: 'education', required: false, description: 'Return Based on education' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get('staffLogin/college/users')
  async findAllStaffUnderCollegeUser(@Query() queryParams: { limit?: number; skip?: number }, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getUser = await this.usersService.findAllUserUnderCollegeOutsite(queryParams, decodedToken.id);
      if (!_.isEmpty(getUser.userList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUser.userList,
          count: getUser.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getUser.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Get('leaderboard')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.' })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.' })
  @ApiQuery({ name: 'email', required: false, description: 'Filters by college using email.' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Filters by college using mobileNumber.' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Filters by college using lastName.' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Filters by college using firstName.' })
  async getLeaderBoard(@Request() req, @Res() res: any, @Query() queryParams) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const leaderboardData = await this.usersService.getLeaderBoard(queryParams, decodedToken)
      if (!_.isEmpty(leaderboardData.leaderboard)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: leaderboardData.leaderboard,
          count: leaderboardData.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: leaderboardData.count }, '1004');
      }
    } catch (e) {
      console.log(e)
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get('myranks')
  async getMyRanks(@Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const userRanks = await this.usersService.getUserRanks(decodedToken.id);
      if (userRanks) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: userRanks
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Get('ranks/:userId')
  async getUserRanks(@Param('userId') userId: string, @Request() req, @Res() res: any) {
    try {
      const userRanks = await this.usersService.getUserRanks(userId);
      if (userRanks) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: userRanks
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Get('evaluations/:userId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async getUserEvalutions(@Param('userId') userId: string, @Request() req, @Res() res: any, @Query() queryParams: { limit?: number; skip?: number }) {
    try {
      const userEvaluations = await this.usersService.getUserEvaluations(queryParams, userId);
      if (userEvaluations) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: userEvaluations.results,
          count: userEvaluations.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req, @Res() res: any) {
    try {
      if (!mongoose.isValidObjectId(id)) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
      const decodedToken = verifyAndExtractToken(req.headers);
      const getByStudent = await this.usersService.findById(id, decodedToken.id, decodedToken.role);
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Get('forinterviewer/:userId')
  async findUserForInterviewerById(@Param('userId') id: string, @Request() req, @Res() res: any) {
    try {
      const getByStudent = await this.usersService.findUserForInterviewerByUserId(id);
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedUserDto: UpdatedUserDto, @Request() req, @Res() res: any) {
    try {
      const existingUser = await this.usersService.findUserForExistanceButId(id, updatedUserDto);
      if (existingUser) {
        let code = '1048'; // error code for duplicate email
        if (existingUser.mobileNumber === updatedUserDto.mobileNumber) {
          code = '1149'; // error code for duplicate mobile number
        } else if (existingUser.studentId === updatedUserDto.studentId) {
          code = '1150';
        }
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: code }, code);
        return
      }
      if (!validateDOB(updatedUserDto.dob)) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: 4304 }, 4304);
      }
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateStudent = await this.usersService.update(id, updatedUserDto, decodedToken.id, decodedToken.role);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1006',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1006');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any, @Request() req) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const deleteUser = await this.usersService.delete(id, decodedToken);
      if (deleteUser) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1007', data: { _id: (deleteUser as any).id } }, '1007');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.log("Error:", e);
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, })
  @Get('/earnings/:userId')
  async getUserEarnings(@Param('userId') userId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const userEarningsData = await this.usersService.findAllUserEarnings(queryParams, userId);
      if (!_.isEmpty(userEarningsData.userEarningsList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1501',
          data: userEarningsData.userEarningsList,
          count: userEarningsData.count
        }, '1501');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1502', data: [], count: userEarningsData.count }, '1502')
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post('/awardgems')
  async createUserAwardGems(@Body() userAwardGemsDto: UserAwardGemsDto, @Request() req, @Res() res: any) {
    try {
      const gemId = userAwardGemsDto.gemId;
      const getGemDetails = await this.gemsService.findById(gemId)
      if (getGemDetails.value > 5000) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5023' }, '5023');
        return;
      }
      const decodedToken = verifyAndExtractToken(req.headers);
      const createUserAward = await this.usersService.saveUserAwardGems(userAwardGemsDto, getGemDetails.value, decodedToken.email);
      if (createUserAward) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5024',
          data: {
            _id: (createUserAward as any).id,
            createdAt: (createUserAward as any).createdAt,
          }
        }, '5024');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'userId', required: false, })
  @ApiQuery({ name: 'unitId', required: false, })
  @ApiQuery({ name: 'moduleId', required: false, })
  @ApiQuery({ name: 'lastName', required: false, description: 'lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'firstName' })
  @Get('activities/list')
  async getUsersActivities(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const result = await this.usersService.findAllUserActivies(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: result.activities, count: result.count }, '1004');
    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserAdminGuard)
  @ApiBearerAuth()
  @Get('activities/:userId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async findUserActivityById(@Param('userId') userId: string, @Res() res: any, @Query() queryParams) {
    try {
      const getUserActivites = await this.usersService.findUserActivityById(userId, queryParams)
      if (!_.isEmpty(getUserActivites.userActivities)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUserActivites.userActivities,
          count: getUserActivites.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getUserActivites.count }, '1004');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Get('myactivities/:userId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async findMyActivityById(@Param('userId') userId: string, @Res() res: any, @Query() queryParams) {
    try {
      const getUserActivites = await this.usersService.findMyActivityById(userId, queryParams)
      if (!_.isEmpty(getUserActivites.userActivities)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUserActivites.userActivities,
          count: getUserActivites.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getUserActivites.count }, '1004');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Get('learningprogress/:userId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async getUserLearningProgress(@Param('userId') userId: string, @Res() res: any, @Query() queryParams) {
    try {
      const userProgressStatusList = await this.usersService.findUserLearningProgressStatus(userId, queryParams)
      if (!_.isEmpty(userProgressStatusList.userLearnings)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: userProgressStatusList.userLearnings,
          count: userProgressStatusList.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: userProgressStatusList.count }, '1004');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Put('unlockunit/:unitId')
  async unlockUnitForUser(@Param('unitId') unitId: string, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const unlockData = await this.usersService.unlockUnitForUser(unitId, decodedToken.id);
      if (unlockData.status === 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4302', data: '', }, '4302');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: unlockData.code, data: [], }, unlockData.code);
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Post('purchase')
  async getUserGemsPurchase(@Body() paymentDto: PaymentDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const userData = await this.usersService.findUserProfileById(decodedToken?.id);
      if (!userData) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
      const result: any = await this.usersService.userGemsPurchase(paymentDto, decodedToken.id);
      if (result.status === 'error') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result?.code, data: result?.data }, result?.code);
      }

      return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: result?.code, data: result?.data }, result?.code);

    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Post('bulkupload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload file', type: BulkUploadFileDto })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Res() res: any,
  ) {
    const decodedToken = verifyAndExtractToken(req.headers);
    const { userType, collegeId, isLmsUser, lmsUserType } = req.body;

    if (userType === 'PREMIUM') {
      if (!collegeId) {//collegeId is required when user is PREMIUM
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5012' }, '5012');
      }
      const college = await this.usersService.findCollegeById(collegeId);
      if (!college) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5022' }, '5022');
      }
    }
    if (!file) {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5014' }, '5014');
    }
    const filePath = file.path;
    const fileExtension = filePath.split('.').pop();

    if (fileExtension !== 'xlsx' && fileExtension !== 'csv') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5014' }, '5014');
    }
    try {
      const result: any = await this.usersService.parseFile(filePath, decodedToken.id, decodedToken.role, collegeId, userType, isLmsUser, lmsUserType );
      if (result.status === 'success') {
        return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: result.code, data: result.data }, result.code);
      } else {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result.code, data: result.data }, result.code);
      }
    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put('assignReferralCode/:userId')
  async assignReferralCode(@Param('userId') userId: string, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const result = await this.usersService.assignReferralCodeForUser(userId, decodedToken);
      if (result.status === 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: result.code, data: result.data }, result.code);
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result.code, data: [], }, result.code);
      }
    } catch (e) {
      console.log("Error#", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put('clearDeviceId/:userId')
  async clearDeviceId(@Param('userId') userId: string, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const result = await this.usersService.clearDeviceIdForUser(userId, decodedToken);
      if (result.status === 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: result.code }, result.code);
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result.code, data: [], }, result.code);
      }
    } catch (e) {
      console.log("Error#", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Get('reportSummary/:userId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async getUserReportSummary(@Param('userId') userId: string, @Res() res: any) {
    try {
      if (!userId) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
      const userProgressStatusList = await this.usersService.getUserSummaryReports(userId)
      if (!_.isEmpty(userProgressStatusList.mergedResults)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: {
            summary: userProgressStatusList.mergedResults,
            user: userProgressStatusList.user
          },
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [] }, '1004');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleAwardGemsCron() {
    await this.usersService.awardGemsToUsers();
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Get('downloadPdf/:userId')
  async downloadPdf(@Param('userId') userId: string, @Res() res: Response) {
    try {
      if (!userId) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
      const userPdfList = await this.usersService.generatePdf(userId)
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="user_report_${userId}.pdf"`,
        'Content-Length': userPdfList.length,
      });
      return res.send(userPdfList)
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }


}
