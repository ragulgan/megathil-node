import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { InterviewerService } from './interviewer.service';
import { CreateInterviewerDto, InterviewerChangepasswordDto, InterviewerForgotPasswordDto, InterviewerResetPasswordDto } from './dto/createInterviewer.dto';
import { UpdatedInterviewerDto } from './dto/updateInterviewer.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { PASSWORDVALID, appConst } from '../libs/constants';
import { AdminGuard, InterviewerAdminGuard, InterviewerGuard, UserGuard } from '../auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Interviewer, } from './interviewer.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { getErrorCode, verifyAndExtractToken } from '../utill/utill';

@ApiTags('Interviewer')
@Controller('interviewer')
export class InterviewerController {
  constructor(
    private readonly InterviewerService: InterviewerService,
    private readonly responseService: ResponseService,
    @InjectModel(Interviewer.name) private InterviewerModel: Model<Interviewer>,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createInterviewerDto: CreateInterviewerDto, @Res() res: Response, @Request() req: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const existingInterviewer = await this.InterviewerModel.findOne({
        $or: [{ mobileNumber: createInterviewerDto.mobileNumber }, { email: createInterviewerDto.email }],
      });
      if (!existingInterviewer) {
        const createdInterviewer = await this.InterviewerService.create(createInterviewerDto, decodedToken);
        if (createdInterviewer) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '1079',
            data: {
              _id: (createdInterviewer as any).id,
              createdAt: (createdInterviewer as any).createdAt,
            }
          }, '1079');
        }
        else {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
      }
      else {
        const code = getErrorCode(existingInterviewer, createInterviewerDto);
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: code }, code);
      }

    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getInterviewerProfile(@Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getInterviewerProfile = await this.InterviewerService.findById(decodedToken.id);
      if (getInterviewerProfile) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getInterviewerProfile
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005' }, '1005');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Put('profile/update')
  async interviewerProfileUpdate(@Body() updatedInterviewerDto: UpdatedInterviewerDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateUser = await this.InterviewerService.profileUpdate(decodedToken.id, updatedInterviewerDto, decodedToken);
      if (!_.isEmpty(updateUser)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1080',
          data: {
            _id: (updateUser as any).id,
            updatedAt: (updateUser as any).updatedAt,
          }
        }, '1080');
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
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'qualification', required: false, description: 'Return Based on qualification' })
  @ApiQuery({ name: 'gender', required: false, description: 'Return Based on gender' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getInterviewer = await this.InterviewerService.findAll(queryParams);
      if (!_.isEmpty(getInterviewer && getInterviewer.InterviewerList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getInterviewer.InterviewerList,
          count: getInterviewer.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getInterviewer.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get('dropdown')
  async listForDropdown(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const interviewers = await this.InterviewerService.findAllForDropdown(queryParams);
      if (interviewers && interviewers.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: interviewers,
          count: interviewers.length
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: 0 }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'qualification', required: false, description: 'Return Based on qualification' })
  @ApiQuery({ name: 'gender', required: false, description: 'Return Based on gender' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get('listForUsers')
  async listForUsers(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getInterviewer = await this.InterviewerService.listInterviewersForUsers(queryParams);
      if (!_.isEmpty(getInterviewer && getInterviewer.InterviewerList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getInterviewer.InterviewerList,
          count: getInterviewer.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getInterviewer.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get('detailsforuser/:interviewerId')
  async findDetailsForUser(@Param('interviewerId') interviewerId: string, @Res() res: any) {
    try {
      const interviewerDetails = await this.InterviewerService.findInterviewerForUser(interviewerId)
      if (interviewerDetails) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: interviewerDetails
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.InterviewerService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedInterviewerDto: UpdatedInterviewerDto, @Res() res: any, @Request() req: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const updateStudent = await this.InterviewerService.update(id, updatedInterviewerDto, decodedToken);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1080',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1080');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any, @Request() req: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const deleteInterviewer = await this.InterviewerService.delete(id, decodedToken);
      if (deleteInterviewer) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1081', data: { _id: (deleteInterviewer as any).id } }, '1081');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('changepassword')
  async InterviewerChangepassword(@Body() interviewerChangepasswordDto: InterviewerChangepasswordDto, @Res() res: Response, @Request() req) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const passwordData = await this.InterviewerService.InterviewerChangepassword(interviewerChangepasswordDto, decodedToken.id);
      if (!_.isEmpty(passwordData)) {
        const params = {
          interviewerId: passwordData._id.toString(),
          activity: "Password Updated",
          action: "password_updated",
          shortDescription: "password was updated",
        }
        await this.InterviewerService.logInterViewerActivity(params)
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2004',
        }, '2004');
      }
    } catch (error) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: PASSWORDVALID[error.message] }, PASSWORDVALID[error.message]);
    }
  }

  @Post('forgotpassword')
  async InterviewerForgotPassword(@Body() interviewerForgotPasswordDto: InterviewerForgotPasswordDto, @Res() res: Response, @Request() req) {
    try {
      const passwordData = await this.InterviewerService.interviewerForgotPassword(interviewerForgotPasswordDto);
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
  async InterviewerResetPassword(@Body() interviewerForgotPasswordDto: InterviewerResetPasswordDto, @Res() res: Response, @Request() req) {
    try {
      const passwordData = await this.InterviewerService.interviewerResetPassword(interviewerForgotPasswordDto);
      if (!_.isEmpty(passwordData)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2007',
        }, '2007');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1009', }, '1009')
      }
    } catch (error) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('activities/list')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'interviewerId', required: false, })
  @ApiQuery({ name: 'lastName', required: false, description: 'lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'firstName' })
  async getAllInterviewersActivities(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getInterviewerActivites = await this.InterviewerService.findAllInterviewersActivities(queryParams)
      if (!_.isEmpty(getInterviewerActivites.interviewerActivities)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getInterviewerActivites.interviewerActivities,
          count: getInterviewerActivites.count,
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getInterviewerActivites.count, }, '1004');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }


  @UseGuards(InterviewerAdminGuard)
  @ApiBearerAuth()
  @Get('activities/:interviewerId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async findInterviewerActivityById(@Param('interviewerId') interviewerId: string, @Res() res: any, @Query() queryParams) {
    try {
      const getInterviewerActivites = await this.InterviewerService.findInterviewersActivityById(interviewerId, queryParams)
      if (!_.isEmpty(getInterviewerActivites.InterviewerActivities)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getInterviewerActivites.InterviewerActivities,
          count: getInterviewerActivites.count,
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getInterviewerActivites.count, }, '1004');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

}
