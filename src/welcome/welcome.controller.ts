import { Controller, Post, Body, Res, BadRequestException, UseGuards, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { WelcomeService } from './welcome.service';
import { ResponseService } from '../base/controller';
import { CreateWelcomeDto } from './dto/createWelcome.dto'; 
import { appConst } from 'src/libs/constants';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdatedWelcomeDto } from './dto/updateWelcome.dto ';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Welcome')
@Controller('welcome')
export class WelcomeController {

  constructor(
    private readonly welcomeService: WelcomeService, 
    private readonly responseService: ResponseService
  ) { }


  @Post()
  async create(@Body() createWelcomeDto: CreateWelcomeDto, @Res() res: Response) {
    try {
      const createdWelcome = await this.welcomeService.create(createWelcomeDto); 
      if (createdWelcome) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1002',
        }, '1002');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getWelcome = await this.welcomeService.findAll(queryParams);
      if (getWelcome) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getWelcome.WelcomeList
        },  '1004' );
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] },  '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.welcomeService.findById(id)
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


  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedWelcomeDto: UpdatedWelcomeDto, @Res() res: any) {
    try {
      const updateStudent = await this.welcomeService.update(id, updatedWelcomeDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1006',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        },  '1006' );
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' },  '1003' );
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteWelcome = await this.welcomeService.delete(id);
      if (deleteWelcome) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1007', data: { _id: (deleteWelcome as any).id } },  '1007' );
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' },  '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }


}
