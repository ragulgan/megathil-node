import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ResponseService } from 'src/base/controller';
import { MegathilPointsService } from './megathil-points.service';
import { AdminGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { MegathilPointsDto } from './megathil-points.dto';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Megathil Points')
@Controller('megathil-points')
export class MegathilPointsController {
  constructor(
    private readonly megathilPointsService: MegathilPointsService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() megathilPointsDto: MegathilPointsDto, @Res() res: Response) {
    try {
      const exist = await this.megathilPointsService.findByName(megathilPointsDto.name);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '2409' }, '2409');
        return;
      }
      const created = await this.megathilPointsService.create(megathilPointsDto);
      if (created) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '2200', data: created }, '2200');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const badgesData = await this.megathilPointsService.findAll(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: badgesData.badges,
        count: badgesData.count
      }, '1004');
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const badgeDetails = await this.megathilPointsService.findById(id)
      if (badgeDetails) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: badgeDetails }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() megathilPointsDto: MegathilPointsDto, @Res() res: any) {
    try {
      const exist = await this.megathilPointsService.findByNameButId(megathilPointsDto.name, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '2409' }, '2409');
        return;
      }
      const badgeDetails = await this.megathilPointsService.update(id, megathilPointsDto);
      if (badgeDetails) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2200',
          data: {
            _id: (badgeDetails as any).id,
            updatedAt: (badgeDetails as any).updatedAt,
          }
        }, '2200');
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
      const deleted = await this.megathilPointsService.delete(id);
      if (deleted) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '2204', data: { _id: (deleted as any).id } }, '2204');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }
}
