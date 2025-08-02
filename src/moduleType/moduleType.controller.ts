import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ModuleTypeService } from './moduleType.service';
import { CreateModuleTypeDto } from './dto/createModuleType.dto';
import { UpdatedModuleTypeDto } from './dto/updateModuleType.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { ModuleType } from './moduleType.schema';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';


@ApiTags('ModuleType')
@Controller('moduleType')
export class ModuleTypeController {
  constructor(
    private readonly ModuleTypeService: ModuleTypeService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createModuleTypeDto: CreateModuleTypeDto, @Res() res: Response) {
    try {
      const createdModuleType = await this.ModuleTypeService.create(createModuleTypeDto);
      if (createdModuleType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1044',
          data: {
            _id: (createdModuleType as any).id,
            createdAt: (createdModuleType as any).createdAt,
          }
        }, '1044');
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
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'displayName', required: false, description: 'Return Based on displayName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getModuleType = await this.ModuleTypeService.findAll(queryParams);
      if (!_.isEmpty(getModuleType.ModuleTypeList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getModuleType.ModuleTypeList,
          count: getModuleType.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getModuleType.count }, '1005')
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
      const getByStudent = await this.ModuleTypeService.findById(id)
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
  async update(@Param('id') id: string, @Body() updatedModuleTypeDto: UpdatedModuleTypeDto, @Res() res: any) {
    try {
      const updateStudent = await this.ModuleTypeService.update(id, updatedModuleTypeDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1045',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1045');
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
      const deleteModuleType = await this.ModuleTypeService.delete(id);
      if (deleteModuleType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1046', data: { _id: (deleteModuleType as any).id } }, '1046');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
