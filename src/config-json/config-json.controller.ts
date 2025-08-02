import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ConfigJsonService } from './config-json.service';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { CreateConfigDto } from './dto/createConfig-json.dto';
import { AdminGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Config-json')
@Controller('Config-json')
export class ConfigJsonController {
  constructor(
    private readonly ConfigService: ConfigJsonService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createConfigDto: CreateConfigDto, @Res() res: Response) {
    try {
      const getConfig = await this.ConfigService.getConfigId();
      const createdConfig = await this.ConfigService.createJsonContent(getConfig, createConfigDto);
      if (createdConfig) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '7111',
          data: {
            _id: (createdConfig as any).id,
            createdAt: (createdConfig as any).createdAt,
          }
        }, '7111');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @ApiQuery({ name: 'applicationJson', required: false, description: 'Return Based on applicationJson' })
  @Get()
  async findAll(@Res() res: any) {
    try {
      const getConfig = await this.ConfigService.findAll();
      if (!_.isEmpty(getConfig.ConfigList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getConfig.ConfigList
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getConfig.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

}

