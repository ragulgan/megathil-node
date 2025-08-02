import { Controller, Post, Body, Request, Res, BadRequestException, UseGuards, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { Response } from 'express';
import { AdminGuard, JwtAuthGuard, SuperAdminGuard } from 'src/auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { ResponseService } from '../base/controller';
import { CreateAdminDto } from './dto/createAdmin.dto';
import { appConst, VALIDATE_USER } from 'src/libs/constants';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdatedAdminDto } from './dto/updateAdmin.dto ';
import { Roles } from 'src/role/roles.decorator';
import { verifyAndExtractToken } from 'src/utill/utill';
import { PasswordDto } from './dto/password.dto';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Admin')
@Controller('admin')
export class AdminController {

  constructor(
    private readonly AdminService: AdminService,
    private readonly responseService: ResponseService
  ) { }

  @Roles(VALIDATE_USER.SUPER_ADMIN)
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createAdminDto: CreateAdminDto, @Res() res: Response) {
    try {
      const createdAdmin = await this.AdminService.create(createAdminDto);
      if (createdAdmin) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1015',
        }, '1015');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1019' }, '1019');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records per page' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'role', required: false, description: 'Return Based on role' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getAdmin = await this.AdminService.findAll(queryParams);
      if (getAdmin) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getAdmin.AdminList,
          count: getAdmin.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getAdmin.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const getByStudent = await this.AdminService.findById(decodedToken.id)
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
  @Put('profile')
  async updateProfile(@Body() updatedAdminDto: UpdatedAdminDto, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const updateStudent = await this.AdminService.updateProfile(decodedToken.id, updatedAdminDto);
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

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put('profile/update/password')
  async changePassword(@Body() passwordDto: PasswordDto, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const updatedPassword = await this.AdminService.updatePassword(decodedToken.id, passwordDto);
      if (updatedPassword.status === "success") {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: updatedPassword.code,
          data: {
            _id: (updatedPassword.data as any).id,
            updatedAt: (updatedPassword.data as any).updatedAt,
          }
        }, '1006');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: updatedPassword.code }, updatedPassword.code);
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
      const getByStudent = await this.AdminService.findById(id)
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
  async update(@Param('id') id: string, @Body() updatedAdminDto: UpdatedAdminDto, @Res() res: any) {
    try {
      const updateStudent = await this.AdminService.update(id, updatedAdminDto);
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

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteAdmin = await this.AdminService.delete(id);
      if (deleteAdmin) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1017', data: { _id: (deleteAdmin as any).id } }, '1017');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4303' }, '4303');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records per page' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'adminId', required: false, description: 'Admin ID' })
  @ApiQuery({ name: 'lastName', required: false, description: 'lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'firstName' })
  @Get('activities/list')
  async getAllAdminsActivities(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const result = await this.AdminService.getAllAdminActivities(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: result.activities, count: result.count }, '1004');
    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records per page' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @Get('activities/:adminId')
  async getAdminActivities(@Param('adminId') adminId: string, @Res() res: any, @Query() queryParams) {
    try {
      const getAdmin = await this.AdminService.getAdminActivities(adminId, queryParams);
      if (getAdmin) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getAdmin.AdminList,
          count: getAdmin.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getAdmin.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }
}
