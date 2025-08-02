import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CollegeService } from './college.service';
import { CreateCollegeDto } from './dto/createCollege.dto';
import { UpdatedCollegeDto } from './dto/updateCollege.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { College } from './college.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';


@ApiTags('College')
@Controller('college')
export class CollegeController {
  constructor(
    private readonly CollegeService: CollegeService,
    private readonly responseService: ResponseService,
    @InjectModel(College.name) private CollegeModel: Model<College>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createCollegeDto: CreateCollegeDto, @Res() res: Response) {
    try {
      const createdCollege = await this.CollegeService.create(createCollegeDto);
      if (createdCollege) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1050',
          data: {
            _id: (createdCollege as any).id,
            createdAt: (createdCollege as any).createdAt,
          }
        }, '1050');
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
  @ApiQuery({ name: 'institute', required: false, description: 'Return Based on instituteId' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getCollege = await this.CollegeService.findAll(queryParams);
      if (!_.isEmpty(getCollege.CollegeList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getCollege.CollegeList,
          count: getCollege.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getCollege.count }, '1005')
      }
    } catch (error) {
      console.log("Error#", error);
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'name', required: false, description: 'Return Based on name' })
  @ApiQuery({ name: 'institute', required: false, description: 'Return Based on instituteId' })
  @Get('dropdown')
  async findAllActiveColleges(@Query() queryParams: { name: string }, @Res() res: any) {
    try {
      const colleges = await this.CollegeService.findAllForDropdown(queryParams);
      if (colleges && colleges.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: colleges,
          count: colleges.length
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
      const getByStudent = await this.CollegeService.findById(id)
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
  async update(@Param('id') id: string, @Body() updatedCollegeDto: UpdatedCollegeDto, @Res() res: any) {
    try {
      const updateStudent = await this.CollegeService.update(id, updatedCollegeDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1051',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1051');
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
      const deleteCollege = await this.CollegeService.delete(id);
      if (deleteCollege.code === '1052') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1052', data: { _id: id } }, '1052');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: deleteCollege.code }, deleteCollege.code);
      }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

}
