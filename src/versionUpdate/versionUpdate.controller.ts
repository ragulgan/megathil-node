import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { VersionUpdateService } from './versionUpdate.service';
import { CreateVersionUpdateDto } from './dto/createVersionUpdate.dto';
import { UpdatedVersionUpdateDto } from './dto/updateVersionUpdate.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { SuperAdminGuard } from '../auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('VersionUpdate')
@Controller('VersionUpdate')
export class VersionUpdateController {
  constructor(
    private readonly VersionUpdateService: VersionUpdateService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createVersionUpdateDto: CreateVersionUpdateDto, @Res() res: Response) {
    try {
      const platformExist = await this.VersionUpdateService.findByPlatform(createVersionUpdateDto.platform);
      if (platformExist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5007' }, '5007');
        return;
      }
      const versionExist = await this.VersionUpdateService.findByVersionCode(createVersionUpdateDto.versionCode);
      if (versionExist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5008' }, '5008');
        return;
      }
      const createdVersionUpdate = await this.VersionUpdateService.create(createVersionUpdateDto);
      if (createdVersionUpdate) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5004',
          data: {
            _id: (createdVersionUpdate as any).id,
            createdAt: (createdVersionUpdate as any).createdAt,
          }
        }, '5004');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'platform', required: false, description: 'ANDROID/IOS' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getVersionUpdate = await this.VersionUpdateService.findAll(queryParams);
      if (!_.isEmpty(getVersionUpdate.VersionUpdateList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getVersionUpdate.VersionUpdateList,
          count: getVersionUpdate.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getVersionUpdate.count }, '1005')
      }
    } catch (e) {
      console.log("Error:", e);
      throw new BadRequestException();
    }
  }


  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.VersionUpdateService.findById(id)
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

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Put()
  async update(@Body() updatedVersionUpdateDto: UpdatedVersionUpdateDto[], @Res() res: any) {
    try {
      const result = await this.VersionUpdateService.update(updatedVersionUpdateDto);
      if (result && result.status === "success") {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5005', data: {} }, '5005');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result.code }, result.code);
      }
    } catch (e) {
      console.log("Error#", e);
      throw new BadRequestException();
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteVersionUpdate = await this.VersionUpdateService.delete(id);
      if (deleteVersionUpdate) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5006', data: { _id: (deleteVersionUpdate as any).id } }, '5006');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
