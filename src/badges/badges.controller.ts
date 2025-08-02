import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ResponseService } from 'src/base/controller';
import { BadgesService } from './badges.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/jwt-auth.guard';
import { BadgesDto } from './badges.dto';
import { appConst } from '../libs/constants';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Badges')
@Controller('badges')
export class BadgesController {
  constructor(
    private readonly badgesService: BadgesService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() badgesDto: BadgesDto, @Res() res: Response) {
    try {
      const exist = await this.badgesService.findByName(badgesDto.name);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '2409' }, '2409');
        return;
      }
      const created = await this.badgesService.create(badgesDto);
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
      const badgesData = await this.badgesService.findAll(queryParams);
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
      const badgeDetails = await this.badgesService.findById(id)
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
  async update(@Param('id') id: string, @Body() badgedDto: BadgesDto, @Res() res: any) {
    try {
      const exist = await this.badgesService.findByNameButId(badgedDto.name, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '2409' }, '2409');
        return;
      }
      const badgeDetails = await this.badgesService.update(id, badgedDto);
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
      const deleted = await this.badgesService.delete(id);
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
