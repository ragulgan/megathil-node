import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/createUnit.dto';
import { UpdatedUnitDto } from './dto/updateUnit.dto ';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, UserStaffAdminGuard } from 'src/auth/jwt-auth.guard';
import { verifyAndExtractToken } from 'src/utill/utill';
const { ERROR, SUCCESS } = appConst;


@ApiTags('Unit')
@Controller('unit')
export class UnitController {
  constructor(
    private readonly unitService: UnitService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createUnitDto: CreateUnitDto, @Res() res: Response) {
    try {
      const createdUnit = await this.unitService.create(createUnitDto);
      if (createdUnit) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1026',
          data: {
            _id: (createdUnit as any).id,
            createdAt: (createdUnit as any).createdAt,
          }
        }, '1026');
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
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'deviceType', required: false, })
  @ApiQuery({ name: 'userId', required: true, })
  @Get()
  async findAll(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      if (decodedToken.role === 'USER') {
        queryParams["userId"] = decodedToken.id;
      }
      const getUnit = await this.unitService.findAll(queryParams);
      if (getUnit) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUnit.unitList,
          count: getUnit.unitList.length
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
      const getByStudent = await this.unitService.getById(id)
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
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, })
  @Get('/mimimal')
  async findAllMinimal(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getUnit = await this.unitService.findAllMinimal(queryParams);
      if (getUnit) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUnit.unitList,
          count: getUnit.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get('/users/:userId')
  async getUserUnits(@Param('userId') userId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getUnit = await this.unitService.findUserUnits(queryParams, userId);
      if (getUnit) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getUnit.unitList,
          count: getUnit.count
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any, @Request() req) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const getByStudent = await this.unitService.findById(id, decodedToken)
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
  async update(@Param('id') id: string, @Body() updatedUnitDto: UpdatedUnitDto, @Res() res: any) {
    try {
      const updateStudent = await this.unitService.update(id, updatedUnitDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1027',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1027');
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
      const deleteUnit = await this.unitService.delete(id);
      if (deleteUnit) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1028', data: { _id: (deleteUnit as any).id } }, '1028');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
