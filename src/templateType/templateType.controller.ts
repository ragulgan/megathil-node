import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TemplateTypeService } from './templateType.service';
import { CreateTemplateTypeDto } from './dto/createTemplateType.dto';
import { UpdatedTemplateTypeDto } from './dto/updateTemplateType.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { TemplateType } from './templateType.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';


@ApiTags('TemplateType')
@Controller('templateType')
export class TemplateTypeController {
  constructor(
    private readonly TemplateTypeService: TemplateTypeService,
    private readonly responseService: ResponseService,
    @InjectModel(TemplateType.name) private TemplateTypeModel: Model<TemplateType>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createTemplateTypeDto: CreateTemplateTypeDto, @Res() res: Response) {
    try {
      const exist = await this.TemplateTypeService.findByDisplayName(createTemplateTypeDto.displayName, createTemplateTypeDto.displayValue);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1138' }, '1138');
        return;
      }
      const createdTemplateType = await this.TemplateTypeService.create(createTemplateTypeDto);
      if (createdTemplateType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1038',
          data: {
            _id: (createdTemplateType as any).id,
            createdAt: (createdTemplateType as any).createdAt,
          }
        }, '1038');
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
  @ApiQuery({ name: 'name', required: false, description: 'Name' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getTemplateType = await this.TemplateTypeService.findAll(queryParams);
      if (getTemplateType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getTemplateType.TemplateTypeList,
          count: getTemplateType.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', count: getTemplateType.count, data: [] }, '1005')
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
      const getByStudent = await this.TemplateTypeService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent,
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
  async update(@Param('id') id: string, @Body() updatedTemplateTypeDto: UpdatedTemplateTypeDto, @Res() res: any) {
    try {
      const exist = await this.TemplateTypeService.findByDisplayNameButId(updatedTemplateTypeDto.displayName, updatedTemplateTypeDto.displayValue, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1138' }, '1138');
        return;
      }
      const updateStudent = await this.TemplateTypeService.update(id, updatedTemplateTypeDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1039',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1039');
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
      const deleteTemplateType = await this.TemplateTypeService.delete(id);
      if (deleteTemplateType) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1040', data: { _id: (deleteTemplateType as any).id } }, '1040');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
