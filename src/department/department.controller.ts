import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { UpdatedDepartmentDto } from './dto/updateDepartment.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Department } from './department.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';

@ApiTags('Department')
@Controller('department')
export class DepartmentController {
  constructor(
    private readonly DepartmentService: DepartmentService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto, @Res() res: Response) {
    try {
      const exist = await this.DepartmentService.findByName(createDepartmentDto.name, createDepartmentDto.abbreviation);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1156' }, '1156');
        return;
      }
      const createdDepartment = await this.DepartmentService.create(createDepartmentDto);
      if (createdDepartment) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1056',
          data: {
            _id: (createdDepartment as any).id,
            createdAt: (createdDepartment as any).createdAt,
          }
        }, '1056');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getDepartment = await this.DepartmentService.findAll(queryParams);
      if (!_.isEmpty(getDepartment.DepartmentList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getDepartment.DepartmentList,
          count: getDepartment.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getDepartment.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get("dropdown")
  async dropdown(@Query() queryParams: any, @Res() res: any) {
    try {
      const getDepartments = await this.DepartmentService.findAllForDropdown(queryParams);
      if (getDepartments && getDepartments.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getDepartments,
          count: getDepartments.length
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: 0 }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.DepartmentService.findById(id)
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedDepartmentDto: UpdatedDepartmentDto, @Res() res: any) {
    try {
      const exist = await this.DepartmentService.findByNameButId(updatedDepartmentDto.name, updatedDepartmentDto.abbreviation, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1156' }, '1156');
        return;
      }
      const updateStudent = await this.DepartmentService.update(id, updatedDepartmentDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1057',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1057');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteDepartment = await this.DepartmentService.delete(id);
      if (deleteDepartment) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1058', data: { _id: (deleteDepartment as any).id } }, '1058');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
