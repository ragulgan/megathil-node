import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/createstaff.dto';
import { UpdatedStaffDto } from './dto/updateStaff.dto';
import { StaffChangepasswordDto, StaffForgotPasswordDto, StaffResetPasswordDto } from './dto/staffChangepassword.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { appConst, PASSWORDVALID } from '../libs/constants';
import { AdminGuard, StaffAdminGuard, StaffGuard, UserStaffAdminGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Staff } from './staff.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { verifyAndExtractToken, getErrorCode } from '../utill/utill';


@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(
    private readonly StaffService: StaffService,
    private readonly responseService: ResponseService,
    @InjectModel(Staff.name) private StaffModel: Model<Staff>,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createStaffDto: CreateStaffDto, @Request() req, @Res() res: Response) {
    try {
      const existingStaff = await this.StaffModel.findOne({
        $or: [{ mobileNumber: createStaffDto.mobileNumber }, { email: createStaffDto.email }, { staffId: createStaffDto.staffId }], status: { $ne: 'DELETED' }
      });
      if (!existingStaff) {
        const decodedToken = verifyAndExtractToken(req.headers);
        const createdStaff = await this.StaffService.create(createStaffDto, decodedToken);
        if (createdStaff) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '1011',
            data: {
              _id: (createdStaff as any).id,
              createdAt: (createdStaff as any).createdAt,
            }
          }, '1011');
        }
        else {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
      }
      else {
        const code = getErrorCode(existingStaff, createStaffDto);
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: code }, code);
      }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getStaffProfile(@Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getStaffProfile = await this.StaffService.findById(decodedToken.id);
      if (getStaffProfile) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getStaffProfile
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005' }, '1005');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(StaffGuard)
  @ApiBearerAuth()
  @Put('profile/update')
  async staffProfileUpdate(@Body() updatedStaffDto: UpdatedStaffDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateUser = await this.StaffService.updateStaffModel(decodedToken.id, updatedStaffDto,);
      if (!_.isEmpty(updateUser)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1012',
          data: {
            _id: (updateUser as any).id,
            updatedAt: (updateUser as any).updatedAt,
          }
        }, '1012');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'registerdDateTo', required: false, description: 'Resistered to date.' })
  @ApiQuery({ name: 'registerdDateFrom', required: false, description: 'Resistered from date.' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filters by department using department id.' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filters by course using course id.' })
  @ApiQuery({ name: 'collegeId', required: false, description: 'Filters by college using college id.' })
  @ApiQuery({ name: 'staffId', required: false, description: 'Return Based on staff ID.' })
  @ApiQuery({ name: 'gender', required: false, description: 'Return Based on gender' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getStaff = await this.StaffService.findAll(queryParams);
      if (!_.isEmpty(getStaff && getStaff.StaffList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getStaff.StaffList,
          count: getStaff.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getStaff.count }, '1005')
      }
    } catch (error) {
      console.log("error#", error)
      throw new BadRequestException();
    }
  }


  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @Get('minimal')
  async findMinimalStaffs(@Res() res: any) {
    try {
      const StaffList = await this.StaffService.findStaffsMinimal();
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: StaffList,
        count: StaffList.length
      }, '1004');
    } catch (error) {
      console.log("error#", error)
      throw new BadRequestException();
    }
  }


  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.StaffService.findById(id)
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

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedStaffDto: UpdatedStaffDto, @Request() req, @Res() res: any) {
    try {
      const existingStaff = await this.StaffModel.findOne({
        $or: [{ mobileNumber: updatedStaffDto.mobileNumber }, { email: updatedStaffDto.email }],
        _id: { $ne: id }, status: { $ne: 'DELETED' }
      });
      if (existingStaff) {
        let code = '1010'; // error code for exiting email
        if (existingStaff.mobileNumber === updatedStaffDto.mobileNumber) {
          code = '1110'; // error code for existing mobile number
        }
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: code }, code);
        return
      }
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateStudent = await this.StaffService.update(id, updatedStaffDto, decodedToken);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1012',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1012');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const deleteStaff = await this.StaffService.delete(id, decodedToken);
      if (deleteStaff) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1013', data: { _id: (deleteStaff as any).id } }, '1013');
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
  @ApiQuery({ name: 'staffId', required: false, })
  @ApiQuery({ name: 'lastName', required: false, description: 'lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'firstName' })
  @Get('activities/list')
  async getAllStaffActivities(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const result = await this.StaffService.findAllStaffActivities(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: result.activities,
        count: result.count
      }, '1004');
    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get('activities/:staffId')
  async getStaffActivities(@Param('staffId') staffId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const activityData = await this.StaffService.findAllStaffActivities({ ...queryParams, staffId });
      if (!_.isEmpty(activityData && activityData.activities)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: activityData.activities,
          count: activityData.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: 0 }, '1005')
      }
    } catch (error) {
      console.log("error#", error)
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Post('changepassword')
  async staffChangepassword(@Body() staffChangepasswordDto: StaffChangepasswordDto, @Res() res: Response, @Request() req) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const passwordData = await this.StaffService.staffChangepassword(staffChangepasswordDto, decodedToken.id);
      if (!_.isEmpty(passwordData)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2004',
        }, '2004');
      }
    } catch (error) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: PASSWORDVALID[error.message] }, PASSWORDVALID[error.message]);
    }
  }

  @Post('forgotpassword')
  async staffForgotPassword(@Body() staffForgotPasswordDto: StaffForgotPasswordDto, @Res() res: Response, @Request() req) {
    try {
      const passwordData = await this.StaffService.staffForgotPassword(staffForgotPasswordDto);
      if (!_.isEmpty(passwordData)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1008',
        }, '1008');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', }, '1005')
      }
    } catch (error) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @Post('resetpassword')
  async staffResetPassword(@Body() staffResetPasswordDto: StaffResetPasswordDto, @Res() res: Response, @Request() req) {
    try {
      const passwordData = await this.StaffService.staffResetPassword(staffResetPasswordDto);
      if (!_.isEmpty(passwordData)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2006',
        }, '2006');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1009', }, '1009')
      }
    } catch (error) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }
}
