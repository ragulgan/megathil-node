import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Module, Request } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/createModule.dto';
import { UpdatedModuleDto } from './dto/updateModule.dto ';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Modules } from './module.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { extractTokenFromHeaders, verifyAndExtractToken } from '../utill/utill'
import * as jwt from 'jsonwebtoken';

@ApiTags('Module')
@Controller('module')
export class ModuleController {
  constructor(
    private readonly ModuleService: ModuleService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto, @Res() res: Response) {
    try {
      const createdModule = await this.ModuleService.create(createModuleDto);
      if (createdModule) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1023',
          data: {
            _id: (createdModule as any).id,
            createdAt: (createdModule as any).createdAt,
          }
        }, '1023');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  // @ApiQuery({ name: 'ModuleId', required: false, description: 'Return Based on ModuleId' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getModule = await this.ModuleService.findAll(queryParams);
      if (getModule) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getModule.ModuleList
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('details/:id')
  async getDetailsId(@Param('id') id: string, @Res() res: any, @Request() req) {
    try {
      const details = await this.ModuleService.getById(id)
      if (details) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: details
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
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @Get('minimal/:unitId')
  async findModulesByUnitId(@Param('unitId') unitId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getModule = await this.ModuleService.findMinimalByUnitId(queryParams, unitId);
      if (!_.isEmpty(getModule)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: { modules: getModule.moduleList, unit: getModule.unit },
          count: getModule.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getModule.moduleList.length }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req, @Res() res: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const getByStudent = await this.ModuleService.findById(id, decodedToken)
      if (!_.isEmpty(getByStudent)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedModuleDto: UpdatedModuleDto, @Res() res: any) {
    try {
      const updateStudent = await this.ModuleService.update(id, updatedModuleDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1024',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1024');
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
      const deleteModule = await this.ModuleService.delete(id);
      if (deleteModule) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1025', data: { _id: (deleteModule as any).id } }, '1025');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
