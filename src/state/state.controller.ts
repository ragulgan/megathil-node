import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/createState.dto';
import { UpdatedStateDto } from './dto/updateState.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('State')
@Controller('state')
export class StateController {
  constructor(
    private readonly StateService: StateService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createStateDto: CreateStateDto, @Res() res: Response) {
    try {
      const exist = await this.StateService.findByName(createStateDto.stateName);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1171' }, '1171');
        return;
      }
      const createdState = await this.StateService.create(createStateDto);
      if (createdState) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1071',
          data: {
            _id: (createdState as any).id,
            createdAt: (createdState as any).createdAt,
          }
        }, '1071');
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
  @ApiQuery({ name: 'stateName', required: false, description: 'Return Based on stateName' })
  @ApiQuery({ name: 'countryId', required: false, description: 'Return Based on countryId' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getState = await this.StateService.findAll(queryParams);
      if (!_.isEmpty(getState.StateList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getState.StateList,
          count: getState.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getState.count }, '1005')
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
      const states = await this.StateService.findAllForDropdown(queryParams);
      if (states && states.length) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: states,
          count: states.length
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
      const getByStudent = await this.StateService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1074' }, '1074');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedStateDto: UpdatedStateDto, @Res() res: any) {
    try {
      const exist = await this.StateService.findByNameButId(updatedStateDto.stateName, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1171' }, '1171');
        return;
      }
      const updateStudent = await this.StateService.update(id, updatedStateDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1072',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1072');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1074' }, '1074');
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
      const deleteState = await this.StateService.delete(id);
      if (deleteState) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1073', data: { _id: (deleteState as any).id } }, '1073');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1074' }, '1074');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
