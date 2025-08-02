import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/createCountry.dto';
import { UpdatedCountryDto } from './dto/updateCountry.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from './country.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';

@ApiTags('Country')
@Controller('country')
export class CountryController {
  constructor(
    private readonly CountryService: CountryService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createCountryDto: CreateCountryDto, @Res() res: Response) {
    try {
      const exist = await this.CountryService.findByName(createCountryDto.countryName, createCountryDto.countryCode);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1167' }, '1167');
        return;
      }
      const createdCountry = await this.CountryService.create(createCountryDto);
      if (createdCountry) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1067',
          data: {
            _id: (createdCountry as any).id,
            createdAt: (createdCountry as any).createdAt,
          }
        }, '1067');
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
  @ApiQuery({ name: 'countryName', required: false, description: 'Return Based on countryName' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'Return Based on countryName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getCountry = await this.CountryService.findAll(queryParams);
      if (!_.isEmpty(getCountry.CountryList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getCountry.CountryList,
          count: getCountry.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getCountry.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'name', required: false, description: 'Return Based on country name' })
  @Get('dropdown')
  async findAllActiveCities(@Query() queryParams: { name: string }, @Res() res: any) {
    try {
      const countries = await this.CountryService.findAllForDropdown(queryParams);
      if (countries && countries.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: countries,
          count: countries.length
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
      const getByStudent = await this.CountryService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1070' }, '1070');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedCountryDto: UpdatedCountryDto, @Res() res: any) {
    try {
      const exist = await this.CountryService.findByNameButId(updatedCountryDto.countryName, updatedCountryDto.countryCode, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1167' }, '1167');
        return;
      }
      const updateStudent = await this.CountryService.update(id, updatedCountryDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1068',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1068');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1070' }, '1070');
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
      const deleteCountry = await this.CountryService.delete(id);
      if (deleteCountry) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1069', data: { _id: (deleteCountry as any).id } }, '1069');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1070' }, '1070');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
