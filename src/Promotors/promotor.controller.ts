import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { PromoCodeService } from './promotor.service';
import { CreatePromotorDto } from './dto/createPromotor.dto';
import { UpdatePromotorDto } from './dto/updatePromotor.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard, PromotorAdminGuard, PromotorGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { verifyAndExtractToken } from '../utill/utill';


@ApiTags('Promotors')
@Controller('Promotor')
export class PromotorController {
  constructor(
    private readonly PromotorService: PromoCodeService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createPromoCodeDto: CreatePromotorDto, @Request() req, @Res() res: any) {
    try {
      const existingPromo = await this.PromotorService.findPromotorForExistance(createPromoCodeDto);
      let code = '';
      if (existingPromo) {
        if (existingPromo.email === createPromoCodeDto.email) code = '1048';
        else if (existingPromo.mobileNumber === createPromoCodeDto.mobileNumber) code = '1149';
        else if (existingPromo.promotedCode === createPromoCodeDto.promotedCode) code = '5110';
        if (code) {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
          return;
        }
      }
      const createdPromotor = await this.PromotorService.create(createPromoCodeDto)
      if (createdPromotor) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5105',
          data: {
            _id: (createdPromotor as any).id,
            createdAt: (createdPromotor as any).createdAt,
          }
        }, '5105');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    }
    catch (e) {
      console.log('e====>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'promotedCode', required: false, description: 'Return Based on promo code' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on firstName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const result = await this.PromotorService.findAll(queryParams);
      if (!_.isEmpty(result && result.PromotorList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: result.PromotorList,
          count: result.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false, description: 'Return Based on user ID' })
  @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on user mobileNumber' })
  @ApiQuery({ name: 'email', required: false, description: 'Return Based on user email' })
  @ApiQuery({ name: 'lastName', required: false, description: 'Return Based on user lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'Return Based on user firstName' })
  @Get('/userList')
  async findSupplierRelatedProduct(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const result = await this.PromotorService.findAllUser(queryParams, decodedToken.id, decodedToken.role);
      if (!_.isEmpty(result && result.PromotorUserList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: result.PromotorUserList,
          count: result.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
      }
    } catch (e) {
      console.log('e===>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records per page' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @Get('activities/:promotorId')
  async getPromotorActivities(@Param('promotorId') promotorId: string, @Res() res: any, @Query() queryParams) {
    try {
      const getPromotorActivity = await this.PromotorService.getPromotorActivities(promotorId, queryParams);
      if (getPromotorActivity) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getPromotorActivity.PromotorActivityList,
          count: getPromotorActivity.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getPromotorActivity.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorGuard)
    @ApiBearerAuth()
    @Get('userList/myactivities/:userId')
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    async findPromotorUserActivityById(@Param('userId') userId: string, @Res() res: any, @Request() req, @Query() queryParams) {
      try {
        const decodedToken = verifyAndExtractToken(req.headers);
        const getUserActivites = await this.PromotorService.findMyUserActivityById(userId, decodedToken.id, decodedToken.role, queryParams)
        if (!_.isEmpty(getUserActivites.userActivities)) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '1004',
            data: getUserActivites.userActivities,
            count: getUserActivites.count
          }, '1004');
        } else {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getUserActivites.count }, '1004');
        }
      } catch {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByPromocode = await this.PromotorService.findById(id)
      if (getByPromocode) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByPromocode
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedUserDto: UpdatePromotorDto, @Res() res: any) {
    try {
      const existingUser = await this.PromotorService.findPromotorForExistanceButId(id, updatedUserDto);
      let code = '';
      if (existingUser) {
        if (existingUser.email === updatedUserDto.email) code = '1048';
        else if (existingUser.mobileNumber === updatedUserDto.mobileNumber) code = '1149';
        else if (existingUser.promotedCode === updatedUserDto.promotedCode) code = '5110';
        if (code) {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
          return;
        }
      }
      const updatePromotor = await this.PromotorService.update(id, updatedUserDto);
      if (updatePromotor) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5106',
          data: {
            _id: (updatePromotor as any).id,
            updatedAt: (updatePromotor as any).updatedAt,
          }
        }, '5106');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch (e) {
      console.error('update error====>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deletePromotor = await this.PromotorService.delete(id);
      if (deletePromotor) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5107', data: { _id: (deletePromotor as any).id } }, '5107');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }
}
