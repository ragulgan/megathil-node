import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import * as _ from 'lodash';
import { CreateAdminDto } from '../adminUsers/dto/createAdmin.dto';
import { AdminService } from 'src/adminUsers/admin.service';
import * as jwt from 'jsonwebtoken';
import { OtpService } from "../otp/otp.service";
import { AdminChangePasswordInterviewerDto, AdminChangePasswordStaffDto, InitiateDto, InterviewerLoginDto, LoginDto, OtpDto, PromotorLoginDto, StaffLoginDto } from './dto/logindto';
import { StaffService } from 'src/staff/staff.service';
import { InterviewerService } from '../interviewer/interviewer.service';
const moment = require('moment');
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const saltOrRounds = 10;
import { AdminActivity } from '../adminUsers/adminActivites.schema';
import { PromoCodeService } from '../Promotors/promotor.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly staffService: StaffService,
    private readonly promotorService: PromoCodeService,
    private readonly interviewerService: InterviewerService,
    private readonly otpService: OtpService,
    @InjectModel(AdminActivity.name) private AdminActivityModel: Model<AdminActivity>,
  ) { }

  decodeToken(token: string): any {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }


  async validateUser(mobileNumber: string, createUserDto): Promise<User> {
    const result = await this.usersService.findAll(mobileNumber);
    const user = result.userList[0];
    if (user) {
      return user;
    }
  }

  async validateUserByEmail(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }
    return user;
  }

  async adminLogin(createAdminDto) {
    const result = await this.adminService.adminLogin(createAdminDto);
    if (!result) return false;
    const payload = await this.adminGeneratePayload(result);
    if (payload.role === "ADMIN" || payload.role === 'SUPER_ADMIN') {
      this.adminService.logAdminActivities({
        adminId: payload.id,
        action: 'admin_authenticated',
        activity: 'Admin Authenticated',
        reason: `Logged in`
      }).then(() => { });
    }
    return {
      user: result,
      token: this.jwtService.sign(payload)
    };
  }

  async handleStaffLogin(staffLoginDto: StaffLoginDto) {
    const staffDetails = await this.staffService.authenticateStaff(staffLoginDto);
    if (staffDetails) {
      const isPasswordMatch = await bcrypt.compare(staffLoginDto.password, staffDetails.password);
      if (isPasswordMatch) {
        try {//logging staff activities
          this.staffService.saveStaffActivity({
            staffId: staffDetails.id,
            action: 'staff_authenticated',
            activity: 'Staff Authenticated',
            usefullId: staffDetails.id,
            usefullIdFor: 'staffid',
            reason: `Logged in`
          }).then(() => { });
        } catch { }
        const payload: any = {
          id: staffDetails.id,
          firstName: staffDetails.firstName,
          lastName: staffDetails.lastName,
          email: staffDetails.email,
          mobileNumber: staffDetails.mobileNumber,
          profileImage: staffDetails.profileImage,
          college: staffDetails.college,
          role: 'STAFF'
        }
        return {
          staff: payload,
          token: this.jwtService.sign(payload),
        };
      }
    }
    return false;
  }

  async handleInterviewerLogin(interviewerLoginDto: InterviewerLoginDto) {
    const interviewerDetails = await this.interviewerService.authenticateInterviewer(interviewerLoginDto);
    if (interviewerDetails) {
      const isPasswordMatch = await bcrypt.compare(interviewerLoginDto.password, interviewerDetails.password);
      if (isPasswordMatch) {
        const payload = await this.interviewerPayload(interviewerDetails);
        const params = {
          interviewerId: payload.id,
          activity: "Logged In",
          action: "logged_in",
          shortDescription: 'logged in',
        }
        await this.interviewerService.logInterViewerActivity(params)
        return {
          interviewer: payload,
          token: this.jwtService.sign(payload),
        };
      }
    }
    return false;
  }

  async AdminStaffChangePassword(adminChangePasswordStaffDto: AdminChangePasswordStaffDto) {
    const staffDetails = await this.staffService.findById(adminChangePasswordStaffDto.staffId);
    if (!_.isEmpty(staffDetails)) {
      const hashedPassword = await bcrypt.hash(adminChangePasswordStaffDto.newPassword, saltOrRounds);
      const newStaffviewer = {
        ...adminChangePasswordStaffDto,
        password: hashedPassword,
      };
      const data = await this.staffService.AdminUpdate(newStaffviewer);
      return data;
    } else {
      return false;
    }
  }

  async AdminInterviewerChangePassword(adminChangePasswordInterviewerDto: AdminChangePasswordInterviewerDto) {
    const interviewerDetails = await this.interviewerService.findById(adminChangePasswordInterviewerDto.interviewerId);
    if (!_.isEmpty(interviewerDetails)) {
      const hashedPassword = await bcrypt.hash(adminChangePasswordInterviewerDto.newPassword, saltOrRounds);
      const newInterviewer = {
        ...adminChangePasswordInterviewerDto,
        password: hashedPassword,
      };
      const params = {
        interviewerId: newInterviewer.interviewerId,
        activity: "Admin Password Changed",
        action: "admin_password_changed",
        shortDescription: "Admin password was changed",
      }
      await this.interviewerService.logInterViewerActivity(params)
      const data = await this.interviewerService.AdminUpdate(newInterviewer);
      return data;
    } else {
      return false;
    }
  }

  async superAdminChangePassword(superAdminChangePasswordDto: any) {
    const adminDetails = await this.adminService.findByIdValidate(superAdminChangePasswordDto.adminId);
    if (!adminDetails) {
      return false;
    }
    const currentPassword = adminDetails.password;
    const newPassword = superAdminChangePasswordDto.newPassword;
    const passwordsMatch = await bcrypt.compare(newPassword, currentPassword);
    if (passwordsMatch) {
      return { success: false };
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
    const updatedAdmin = {
      ...adminDetails,
      password: hashedPassword,
    };
    const updatedData = await this.adminService.AdminUpdate(updatedAdmin);
    return {
      success: true, data: {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
        mobileNumber: updatedData.mobileNumber
      }
    };
  }

  async triggerUserLogin(loginDto: LoginDto) {
    return await this.usersService.generateUserOtp(loginDto);
  }

  async verifyOtp(otpDto: OtpDto) {
    const newUser = await this.usersService.validateUserOtp(otpDto);
    if (newUser) {
      const payload = await this.generatePayload(newUser);
      return {
        user: newUser,
        token: this.jwtService.sign(payload),
      };
    }
    return false;
  }

  async refreshToken(decodedToken: any) {
    if (!decodedToken) {
      return { status: 'error', code: '1498' }
    }

    if (!decodedToken.id) {
      return { status: 'error', code: '1498' }
    }

    const user = await this.usersService.findUserById(decodedToken.id);
    if (!user) {
      return { status: 'error', code: '1404' }
    }

    if (user.status == 'DELETED') {
      return { status: 'error', code: '1404' }
    }

    if (user.status == 'INACTIVE') {
      return { status: 'error', code: '1441' }
    }

    const expiredTime = moment.utc(decodedToken.exp * 1000);
    const currentTime = moment.utc();
    const hours = currentTime.diff(expiredTime, 'hours');
    if (hours > 24) {
      return { status: 'error', code: '1440' }
    }

    const userPayload: any = {
      id: decodedToken.id,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      mobileNumber: decodedToken.mobileNumber,
      email: decodedToken.email,
      profileImage: decodedToken.profileImage,
      isExistUser: true,
      role: 'USER',
    }

    return {
      status: 'success',
      code: '1444',
      data: {
        user: userPayload,
        token: this.jwtService.sign(userPayload),
      }
    }
  }

  async initiateUser(decodedToken: any, initiateDto: InitiateDto) {
    if (!decodedToken) {
      return { status: 'error', code: '1498' }
    }

    if (!decodedToken.id) {
      return { status: 'error', code: '1498' }
    }

    const user = await this.usersService.findUserById(decodedToken.id);
    if (!user) {
      return { status: 'error', code: '1404' }
    }

    if (user.status == 'DELETED') {
      return { status: 'error', code: '1404' }
    }

    if (user.status == 'INACTIVE') {
      return { status: 'error', code: '1441' }
    }

    this.usersService.logUserActivity({
      userId: decodedToken.id,
      activity: "Checking login status and authentication.",
      action: 'check_login_status',
      shortDescription: "Checking login status and authentication.",
    }).then(() => { });

    const expiredTime = moment.utc(decodedToken.exp * 1000);
    const currentTime = moment.utc();
    const hours = currentTime.diff(expiredTime, 'hours');
    if (hours > 24) {
      this.usersService.logUserActivity({
        userId: decodedToken.id,
        activity: "Session expired.",
        action: 'session_expired',
        shortDescription: "Session expired.",
      }).then(() => { });
      return { status: 'error', code: '1440' }
    }

    this.usersService.initiateOrUpdateUserUnitStatus(decodedToken.id).then(() => { });

    this.usersService.updateUserDeviceDetails(initiateDto, decodedToken.id).then(() => { });

    const expMinutes = currentTime.diff(expiredTime, 'minutes');

    const userPayload: any = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      email: user.email,
      profileImage: user.profileImage,
      isExistUser: user.isExistUser,
      role: 'USER',
    }

    if (expMinutes > 0) {
      this.usersService.logUserActivity({
        userId: decodedToken.id,
        activity: "Session expired and renewing session.",
        action: 'session_expired',
        shortDescription: "Session expired and renewing session.",
      }).then(() => { });
      return {
        status: 'success', code: '1444', data: {
          user: userPayload,
          token: this.jwtService.sign(userPayload),
        }
      }
    }

    return { status: 'success', code: '1445', data: { user: userPayload } }

  }

  async initiate(decodedToken: any) {
    if (!decodedToken) {
      return { status: 'error', code: '1498' };
    }
    if (!decodedToken.id) {
      return { status: 'error', code: '1498' };
    }
    const data = await this.findById(decodedToken.id, decodedToken.role);
    if (!data) {
      return { status: 'error', code: '1404' };
    }
    if (data.status == 'DELETED') {
      return { status: 'error', code: '1404' };
    }
    if (data.status == 'INACTIVE') {
      return { status: 'error', code: '1441' };
    }
    const expiredTime = moment.utc(decodedToken.exp * 1000);
    const currentTime = moment.utc();
    const hours = currentTime.diff(expiredTime, 'hours');
    if (hours > 24) {
      return { status: 'error', code: '1440' };
    }
    const expMinutes = currentTime.diff(expiredTime, 'minutes');
    const dataPayload: any = {
      id: data._id,
      firstName: data.firstName,
      lastName: data.lastName,
      mobileNumber: data.mobileNumber,
      email: data.email,
      profileImage: data.profileImage,
      role: decodedToken.role,
    };

    if (expMinutes > 0) {
      return {
        status: 'success', code: '1444', data: {
          user: dataPayload,
          token: this.jwtService.sign(dataPayload),
        }
      };
    }
    return { status: 'success', code: '1445', data: { data: dataPayload } };
  }

  async findById(id: string, role: string): Promise<any> {
    if (role === 'STAFF') {
      return await this.staffService.findById(id);
    } else if (role === 'INTERVIEWER') {
      return await this.interviewerService.findById(id);
    } else if (role === 'ADMIN') {
      return await this.adminService.findById(id);
    }
    return null;
  }



  async generatePayload(userData: any) {
    if (!_.isEmpty(userData.email)) {
      return {
        id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        mobileNumber: userData.mobileNumber,
        email: userData.email,
        profileImage: userData.profileImage,
        isExistUser: true,
        role: 'USER',

      }
    } else {
      return {
        id: userData._id,
        mobileNumber: userData.mobileNumber,
        email: userData.email,
        isExistUser: false,
        role: 'USER',
      }
    }
  }

  async adminGeneratePayload(userData: any) {
    return {
      id: userData._id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobileNumber: userData.mobileNumber,
      email: userData.email,
      profileImage: userData.profileImage,
      role: userData.role.role,
    }
  }

  async interviewerPayload(interviewerDetails: any) {
    return {
      firstName: interviewerDetails.firstName,
      lastName: interviewerDetails.lastName,
      email: interviewerDetails.email,
      mobileNumber: interviewerDetails.mobileNumber,
      role: interviewerDetails.role,
      id: interviewerDetails._id,
      profileImage: interviewerDetails.profileImage
    }
  }

  async handlePromotorLogin(promotorLoginDto: PromotorLoginDto) {
    const promotorDetails = await this.promotorService.authenticatePromotor(promotorLoginDto);
    if (promotorDetails) {
      const isPasswordMatch = await bcrypt.compare(promotorLoginDto.password, promotorDetails.password);
      if (isPasswordMatch) {
        const payload: any = {
          id: promotorDetails.id,
          firstName: promotorDetails.firstName,
          lastName: promotorDetails.lastName,
          email: promotorDetails.email,
          mobileNumber: promotorDetails.mobileNumber,
          profileImage: promotorDetails.profileImage,
          role: promotorDetails.role
        }
        if (promotorDetails.role === "PROMOTOR") {
          this.promotorService.logPromotorActivities({
            promotorId: promotorDetails.id,
            action: 'promotor_authenticated',
            activity: 'Promotor Authenticated',
            reason: `Promotor Logged in`
          }).then(() => { });
        }
        return {
          promotor: payload,
          token: this.jwtService.sign(payload),
        };
      }
    }
    return false;
  }
}


