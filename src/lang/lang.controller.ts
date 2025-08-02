import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { LangService } from './lang.service';
import { CreateLangDto } from './dto/createlang.dto';
import { UpdatedLangDto } from './dto/updatelang.dto ';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Lang } from './lang.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';


@ApiTags('Lang')
@Controller('lang')
export class LangController {
  constructor(
    private readonly LangService: LangService, 
    private readonly responseService: ResponseService,
    @InjectModel(Lang.name) private LangModel: Model<Lang>,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createLangDto: CreateLangDto, @Res() res: Response) {
    try {
        const createdLang = await this.LangService.create({
          ...createLangDto,
        });
        if (createdLang) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '1002',
            data: {
              _id: (createdLang as any).id,
              createdAt: (createdLang as any).createdAt,
            }
          }, '1002');
        }
        else {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' },  '1003');
        }

    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'name', required: false, description: 'Return Based on email' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getLang = await this.LangService.findAll(queryParams);
      if (getLang) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getLang.LangList
        },  '1004' );
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] },  '1005')
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
      const getByStudent = await this.LangService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        },  '1004' );
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' },  '1003' );
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedLangDto: UpdatedLangDto, @Res() res: any) {
    try {
      const updateStudent = await this.LangService.update(id, updatedLangDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1012',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        },  '1012' );
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' },  '1003' );
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
      const deleteLang = await this.LangService.delete(id);
      if (deleteLang) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1013', data: { _id: (deleteLang as any).id } },  '1013' );
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' },  '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }
  

}
