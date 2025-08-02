import { Controller, Post, UseGuards, Body, Res, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto, OtpDto, AdminDto, StaffLoginDto, InterviewerLoginDto, AdminChangePasswordStaffDto, AdminChangePasswordInterviewerDto, CreateAdminDto, SuperAdminChangePasswordDto, InitiateDto, PromotorLoginDto } from './dto/logindto';
import { ResponseService } from '../base/controller';
import { appConst } from 'src/libs/constants';
import { AdminGuard, SuperAdminGuard } from './jwt-auth.guard';
import { decodeJWTToken } from 'src/utill/utill';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Auth')
@Controller('auth/')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly responseService: ResponseService,
  ) { }

  @Post('login/user')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const result = await this.authService.triggerUserLogin(loginDto);
    if (result === 'INACTIVE') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, {
        code: '1441'
      }, '1441');
    }
    if (result === 'INCORRECT_MOBILECODE') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
        code: '2003'
      }, '2003');
    }
     if (result === 'OTP_FAILED') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '5029' }, '5029');
    } else if (result === 'LOGIN_FROM_DIFFERENT_DEVICE') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '2001' }, '2001');
    } else if (result === 'FAILED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '2015' }, '2015');
    } else if (result === 'SUCCESS') {
        return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1008'}, '1008');
    } else {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1009' }, '1009');
    }
  }

  @Post('validate/otp')
  @ApiBody({ type: OtpDto })
  async verifyUser(@Body() otpDto: OtpDto, @Res() res) {
    const result: any = await this.authService.verifyOtp(otpDto);
    if (!result) {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '2014' }, '2014');
    }
    if (result && result.user && result?.user?.status  === 'PROMOCODE_INVALID') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, {
        code: '1442'
      }, '1442');
    }
    if (result && result.user && result?.user?.status  === 'PROMOCODE_ONLY_APPLICABLE_NEW_MEMBER') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, {
        code: '1443'
      }, '1443');
    }
    if (result && result.user && result?.user?.status == 'INACTIVE') {
      return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1441'
      }, '1441');
    }
    if (result && result.user && result?.user?.status  === 'OTP_EXPIRED') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, {
        code: '2018'
      }, '2018');
    }
    if (result && result.user && result?.user?.status  === 'INVALID_OTP') {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, {
        code: '2019'
      }, '2019');
    }
    if (result) {
      return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1001',
        data: {
          id: result.user._id,
          email: result.user.email,
          mobileNumber: result.user.mobileNumber,
          isExistUser: result.user.isExistUser,
          status: result.user.status,
          token: result.token
        }
      }, '1001');
    }
  }

  @ApiBearerAuth()
  @Post('user/refreshtoken')
  async refreshToken(@Request() req, @Res() res: any) {
    try {
      const decodedToken = decodeJWTToken(req.headers);
      const refreshData = await this.authService.refreshToken(decodedToken);
      if (refreshData?.status == 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: refreshData.code, data: refreshData.data, }, refreshData.code);
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: refreshData.code, data: '', }, refreshData.code);
      }
    } catch (e) {
      console.log("Error:", e)
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @ApiBearerAuth()
  @Post('user/initiate')
  async initiateUser(@Body() initiateDto: InitiateDto, @Request() req: any, @Res() res: any) {
    try {
      const decodedToken = decodeJWTToken(req.headers);
      const initiated = await this.authService.initiateUser(decodedToken, initiateDto);
      if (initiated.status === 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: initiated.code,
          data: initiated.data
        }, '1006');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: initiated.code }, initiated.code);
      }
    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @Post('login/admin')
  @ApiBody({ type: AdminDto })
  async Admin(@Body() createAdminDto: CreateAdminDto, @Res() res) {
    const result = await this.authService.adminLogin(createAdminDto);
    if (result) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1014',
        data: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profileImage: result.user.profileImage,
          mobileNumber: result.user.mobileNumber,
          email: result.user.email,
          role: result.user.role.role,
          status: result.user.status,
          token: result.token
        }
      }, '1014');
    } else {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1018' }, '1018');
    }
    return result;
  }

  @Post('login/staff')
  @ApiBody({ type: StaffLoginDto })
  async staffLogin(@Body() staffLoginDto: StaffLoginDto, @Res() res) {
    const result = await this.authService.handleStaffLogin(staffLoginDto);
    if (result) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1001',
        data: result
      }, '1001');
    } else {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1101' }, '1101');
    }
    return result;
  }

  @Post('login/interviewer')
  @ApiBody({ type: InterviewerLoginDto })
  async InterviewerLogin(@Body() interviewerLoginDto: InterviewerLoginDto, @Res() res) {
    const result = await this.authService.handleInterviewerLogin(interviewerLoginDto);
    if (result) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1001',
        data: result
      }, '1001');
    } else {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1101' }, '1101');
    }
    return result;
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post('admin/staffChangepassword')
  @ApiBody({ type: AdminChangePasswordStaffDto })
  async AdminStaffChangePassword(@Body() adminChangePasswordStaffDto: AdminChangePasswordStaffDto, @Res() res) {
    const result = await this.authService.AdminStaffChangePassword(adminChangePasswordStaffDto);
    if (result) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '2006',
        data: result
      }, '2006');
    } else {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
    }
    return result;
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post('admin/interviewerChangepassword')
  @ApiBody({ type: AdminChangePasswordInterviewerDto })
  async AdminInterviewerChangePassword(@Body() adminChangePasswordInterviewerDto: AdminChangePasswordInterviewerDto, @Res() res) {
    const result = await this.authService.AdminInterviewerChangePassword(adminChangePasswordInterviewerDto);
    if (result) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '2007',
        data: result
      }, '2007');
    } else {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
    }
    return result;
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post('superAdmin/adminChangepassword')
  @ApiBody({ type: SuperAdminChangePasswordDto })
  async superAdminChangePassword(@Body() superAdminChangePasswordDto: SuperAdminChangePasswordDto, @Res() res) {
    const result = await this.authService.superAdminChangePassword(superAdminChangePasswordDto);
    try {
      if (typeof result === 'object' && result.success) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2004',
          data: result.data
        }, '2004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4303' }, '4303');
      }
    } catch {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @ApiBearerAuth()
  @Post('initiate')
  async initiate(@Request() req: any, @Res() res: any) {
    try {
      const decodedToken = decodeJWTToken(req.headers);
      const initiated = await this.authService.initiate(decodedToken);
      if (initiated.status === 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: initiated.code,
          data: initiated.data
        }, '1012');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: initiated.code }, initiated.code);
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @Post('login/promotor')
  @ApiBody({ type: PromotorLoginDto })
  async promotorLogin(@Body() promotorLoginDto: PromotorLoginDto, @Res() res) {
    const result = await this.authService.handlePromotorLogin(promotorLoginDto);
    if (result) {
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1001',
        data: result
      }, '1001');
    } else {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1101' }, '1101');
    }
    return result;
  }
}
