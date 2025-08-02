import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdatedCourseDto } from './dto/updateCourse.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(
    private readonly CourseService: CourseService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Res() res: Response) {
    try {
      // const exist = await this.CourseService.findByName(createCourseDto.name, createCourseDto.abbreviation);
      // if (exist) {
      //   this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1153' }, '1153');
      //   return;
      // }
      const createdCourse = await this.CourseService.create(createCourseDto);
      if (createdCourse) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1053',
          data: {
            _id: (createdCourse as any).id,
            createdAt: (createdCourse as any).createdAt,
          }
        }, '1053');
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
  @ApiQuery({ name: 'departmentId', required: false, description: 'Return Based on departmentId' })
  @ApiQuery({ name: 'abbreviation', required: false, description: 'Abbreviation' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getCourse = await this.CourseService.findAll(queryParams);
      if (!_.isEmpty(getCourse.CourseList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getCourse.CourseList,
          count: getCourse.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getCourse.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'departmentId', required: false, description: 'Return Based on departmentId' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get("dropdown")
  async dropdown(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getCourses = await this.CourseService.findAllForDropdown(queryParams);
      if (getCourses && getCourses.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getCourses,
          count: getCourses.length
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
      const getByStudent = await this.CourseService.findById(id)
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
  async update(@Param('id') id: string, @Body() updatedCourseDto: UpdatedCourseDto, @Res() res: any) {
    try {
      // const exist = await this.CourseService.findByNameButId(updatedCourseDto.name, updatedCourseDto.abbreviation, id);
      // if (exist) {
      //   this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1153' }, '1153');
      //   return;
      // }
      const updateStudent = await this.CourseService.update(id, updatedCourseDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1054',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1054');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (error) {
      console.error('Error updating course:', error.message);
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteCourse = await this.CourseService.delete(id);
      if (deleteCourse) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1055', data: { _id: (deleteCourse as any).id } }, '1055');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
