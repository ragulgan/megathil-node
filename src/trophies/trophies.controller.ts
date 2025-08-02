import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrophiesService } from './trophies.sercie';
import { AdminGuard } from 'src/auth/jwt-auth.guard';
import { ResponseService } from 'src/base/controller';
import { TrophiesDto } from './dto/trophies.dto';
import { appConst } from '../libs/constants';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Trophies')
@Controller('trophies')
export class TrophiesController {
  constructor(
    private readonly trophiesService: TrophiesService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() trophiesDto: TrophiesDto, @Res() res: Response) {
    try {
      const exist = await this.trophiesService.findByName(trophiesDto.name);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1191' }, '1191');
        return;
      }
      const created = await this.trophiesService.create(trophiesDto);
      if (created) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1091', data: created }, '1091');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const trophyData = await this.trophiesService.findAll(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: trophyData.trophies,
        count: trophyData.count
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
      const trophyDetail = await this.trophiesService.findById(id)
      if (trophyDetail) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: trophyDetail }, '1004');
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
  async update(@Param('id') id: string, @Body() trophiesDto: TrophiesDto, @Res() res: any) {
    try {
      const exist = await this.trophiesService.findByNameButId(trophiesDto.name, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1191' }, '1191');
        return;
      }
      const trophyDetail = await this.trophiesService.update(id, trophiesDto);
      if (trophyDetail) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1092',
          data: {
            _id: (trophyDetail as any).id,
            updatedAt: (trophyDetail as any).updatedAt,
          }
        }, '1092');
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
      const deleted = await this.trophiesService.delete(id);
      if (deleted) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1093', data: { _id: (deleted as any).id } }, '1093');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
