import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExperiencePointsService } from './Xp.service';
import { CreateExperiencePointsDto } from './dto/createXp.dto';
import { UpdatedExperiencePointsDto } from './dto/updateXp.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('ExperiencePoints')
@Controller('experiencePoints')
export class ExperiencePointsController {
  constructor(
    private readonly ExperiencePointsService: ExperiencePointsService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createExperiencePointsDto: CreateExperiencePointsDto, @Res() res: Response) {
    try {
      const exist = await this.ExperiencePointsService.findByName(createExperiencePointsDto.name);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1194' }, '1194');
        return;
      }
      const createdExperiencePoints = await this.ExperiencePointsService.create(createExperiencePointsDto);
      if (createdExperiencePoints) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1094',
          data: {
            _id: (createdExperiencePoints as any).id,
            createdAt: (createdExperiencePoints as any).createdAt,
          }
        }, '1094');
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
  @ApiQuery({ name: 'value', required: false, description: 'Value' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getExperiencePoints = await this.ExperiencePointsService.findAll(queryParams);
      if (!_.isEmpty(getExperiencePoints.ExperiencePointsList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getExperiencePoints.ExperiencePointsList,
          count: getExperiencePoints.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getExperiencePoints.count }, '1005')
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
      const getByStudent = await this.ExperiencePointsService.findById(id)
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
  async update(@Param('id') id: string, @Body() updatedExperiencePointsDto: UpdatedExperiencePointsDto, @Res() res: any) {
    try {
      const exist = await this.ExperiencePointsService.findByNameButId(updatedExperiencePointsDto.name, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1194' }, '1194');
        return;
      }
      const updateStudent = await this.ExperiencePointsService.update(id, updatedExperiencePointsDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1095',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1095');
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
      const deleteExperiencePoints = await this.ExperiencePointsService.delete(id);
      if (deleteExperiencePoints) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1096', data: { _id: (deleteExperiencePoints as any).id } }, '1096');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
