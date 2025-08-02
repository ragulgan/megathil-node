import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { SystemVariablesService } from './systemVariables.service';
import { CreateSystemVariablesDto } from './dto/createSystemVariables.dto';
import { UpdatedSystemVariablesDto } from './dto/updateSystemVariables.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { SuperAdminGuard } from '../auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('SystemVariables')
@Controller('systemVariables')
export class SystemVariablesController {
  constructor(
    private readonly SystemVariablesService: SystemVariablesService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createSystemVariablesDto: CreateSystemVariablesDto, @Res() res: Response) {
    try {
      const exist = await this.SystemVariablesService.findByName(createSystemVariablesDto.name);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4308' }, '4308');
        return;
      }
      const createdSystemVariables = await this.SystemVariablesService.create(createSystemVariablesDto);
      if (createdSystemVariables) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '4305',
          data: {
            _id: (createdSystemVariables as any).id,
            createdAt: (createdSystemVariables as any).createdAt,
          }
        }, '4305');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'value', required: false, description: 'Value' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getSystemVariables = await this.SystemVariablesService.findAll(queryParams);
      if (!_.isEmpty(getSystemVariables.SystemVariablesList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getSystemVariables.SystemVariablesList,
          count: getSystemVariables.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getSystemVariables.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.SystemVariablesService.findById(id)
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

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedSystemVariablesDto: UpdatedSystemVariablesDto, @Res() res: any) {
    try {
      const exist = await this.SystemVariablesService.findByNameButId(updatedSystemVariablesDto.name, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1197' }, '1197');
        return;
      }
      const updateStudent = await this.SystemVariablesService.update(id, updatedSystemVariablesDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '4306',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '4306');
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
      const deleteSystemVariables = await this.SystemVariablesService.delete(id);
      if (deleteSystemVariables) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4307', data: { _id: (deleteSystemVariables as any).id } }, '4307');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
