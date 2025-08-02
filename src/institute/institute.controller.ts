import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { InstituteService } from './institute.service';
import { CreateInstituteDto } from './dto/institute.create.dto';
import { UpdatedInstituteDto } from './dto/institute.update.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';


@ApiTags('Institute')
@Controller('institute')
export class InstituteController {
  constructor(
    private readonly InstituteService: InstituteService,
    private readonly responseService: ResponseService
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createInstituteDto: CreateInstituteDto, @Res() res: Response) {
    try {
      const createdInstitute = await this.InstituteService.create(createInstituteDto);
      if (createdInstitute) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5101',
          data: {
            _id: (createdInstitute as any).id,
            createdAt: (createdInstitute as any).createdAt,
          }
        }, '5101');
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
  @ApiQuery({ name: 'name', required: false, description: 'Return Based on name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getInstitute = await this.InstituteService.findAll(queryParams);
      if (!_.isEmpty(getInstitute.InstituteList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getInstitute.InstituteList,
          count: getInstitute.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getInstitute.count }, '1005')
      }
    } catch (error) {
      console.log("Error#", error);
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'name', required: false, description: 'Return Based on name' })
  @Get('dropdown')
  async findAllActiveInstitutes(@Query() queryParams: { name: string }, @Res() res: any) {
    try {
      const institutes = await this.InstituteService.findAllForDropdown(queryParams);
      if (institutes && institutes.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: institutes,
          count: institutes.length
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: 0 }, '1005')
      }
    } catch (error) {
      console.log("Error#", error);
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByInstitute = await this.InstituteService.findById(id)
      if (getByInstitute) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByInstitute
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
  async update(@Param('id') id: string, @Body() updatedInstituteDto: UpdatedInstituteDto, @Res() res: any) {
    try {
      const updateInstitute = await this.InstituteService.update(id, updatedInstituteDto);
      if (updateInstitute) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5102',
          data: {
            _id: (updateInstitute as any).id,
            updatedAt: (updateInstitute as any).updatedAt,
          }
        }, '5102');
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
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteInstitute = await this.InstituteService.delete(id);
      if (deleteInstitute.code === '5103') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5103', data: { _id: id } }, '5103');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: deleteInstitute.code }, deleteInstitute.code);
      }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

}
