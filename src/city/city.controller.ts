import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/createCity.dto';
import { UpdatedCityDto } from './dto/updateCity.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('City')
@Controller('City')
export class CityController {
  constructor(
    private readonly CityService: CityService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createCityDto: CreateCityDto, @Res() res: Response) {
    try {
      const exist = await this.CityService.findByName(createCityDto.cityName);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1175' }, '1175');
        return;
      }
      const createdCity = await this.CityService.create(createCityDto);
      if (createdCity) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1075',
          data: {
            _id: (createdCity as any).id,
            createdAt: (createdCity as any).createdAt,
          }
        }, '1075');
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
  @ApiQuery({ name: 'cityName', required: false, description: 'Return Based on cityName' })
  @ApiQuery({ name: 'stateId', required: false, description: 'Return Based on stateId' })
  @ApiQuery({ name: 'countryId', required: false, description: 'Return Based on countryId' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getCity = await this.CityService.findAll(queryParams);
      if (!_.isEmpty(getCity.CityList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getCity.CityList,
          count: getCity.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getCity.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'name', required: false, description: 'Return Based on city name' })
  @Get('dropdown')
  async findAllActiveCities(@Query() queryParams: { name: string }, @Res() res: any) {
    try {
      const cities = await this.CityService.findAllForDropdown(queryParams);
      if (cities && cities.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: cities,
          count: cities.length
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
      const getByStudent = await this.CityService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1078' }, '1078');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedCityDto: UpdatedCityDto, @Res() res: any) {
    try {
      const exist = await this.CityService.findByNameButId(updatedCityDto.cityName, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1175' }, '1175');
        return;
      }
      const updateStudent = await this.CityService.update(id, updatedCityDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1076',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1076');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1078' }, '1078');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteCity = await this.CityService.delete(id);
      if (deleteCity) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1077', data: { _id: (deleteCity as any).id } }, '1077');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1078' }, '1078');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
