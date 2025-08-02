import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { GemsPackageService } from './gemsPackage.service';
import { CreateGemsPackageDto } from './dto/createGemsPackage.dto';
import { UpdatedGemsPackageDto } from './dto/updateGemsPackage.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, SuperAdminGuard, UserAdminGuard, PromotorAdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { verifyAndExtractToken } from 'src/utill/utill';
import { CarouselDto } from './dto/carousel.dto';

@ApiTags('GemsPackage')
@Controller('GemsPackage')
export class GemsPackageController {
  constructor(
    private readonly GemsPackageService: GemsPackageService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createGemsPackageDto: CreateGemsPackageDto, @Res() res: Response) {
    const existingUser = await this.GemsPackageService.findGemsPackageForExistance(createGemsPackageDto);
    try {
      if (_.isEmpty(existingUser)) {
        const createdGemsPackage = await this.GemsPackageService.create(createGemsPackageDto);
        if (createdGemsPackage) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '3205',
            data: {
              _id: (createdGemsPackage as any).id,
              createdAt: (createdGemsPackage as any).createdAt,
            }
          }, '3205');
        }
        else {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '3211' }, '3211');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @Get()
  @UseGuards(UserAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'packageName', required: false, description: 'Return Based on packageName' })

  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const getGemsPackage = await this.GemsPackageService.findAll(queryParams, decodedToken);
      if (!_.isEmpty(getGemsPackage.GemsPackageList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getGemsPackage.GemsPackageList,
          count: getGemsPackage.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getGemsPackage.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.GemsPackageService.findById(id)
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedGemsPackageDto: UpdatedGemsPackageDto, @Res() res: any) {
    try {
      const updateStudent = await this.GemsPackageService.update(id, updatedGemsPackageDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '3206',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '3206');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteGemsPackage = await this.GemsPackageService.delete(id);
      if (deleteGemsPackage) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '3207', data: { _id: (deleteGemsPackage as any).id } }, '3207');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorAdminGuard)
  @ApiBearerAuth()
  @Post('carousel')
  async createCarousel(@Body() carouselDto: CarouselDto, @Res() res: Response) {
    try {
      const savedCarousel = await this.GemsPackageService.saveCarousel(carouselDto);
      if (savedCarousel && savedCarousel._id) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '3300',
          data: {
            _id: (savedCarousel as any).id,
            createdAt: (savedCarousel as any).createdAt,
          }
        }, '3300');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '3340' }, '3340');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '3340');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('users/carousel')
  async getCarouselsForUser(@Res() res: Response, @Request() req: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    const userId = decodedToken ? decodedToken.id : null;
    try {
      const carousels = await this.GemsPackageService.getCarouselsForUsers(userId);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '200',
        data: carousels,
        count: carousels.length
      }, '200');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'title', required: false, description: 'Return Based on title' })
  @ApiQuery({ name: 'promotorId', required: false, description: 'Return Based on promotor id' })
  @Get('admin/carousel')
  async getCarouselsForAdmin(@Query() queryParams: any, @Res() res: Response) {
    try {
      const { carousels, count } = await this.GemsPackageService.getCarouselsForAdmin(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '200',
        data: carousels,
        count: count
      }, '200');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorAdminGuard)
  @ApiBearerAuth()
  @Get('carousel/:id')
  async carouselById(@Param('id') id: string, @Res() res: any) {
    try {
      const carousel = await this.GemsPackageService.getCarouselById(id);
      if (carousel) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: carousel
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(PromotorAdminGuard)
  @ApiBearerAuth()
  @Put('carousel/:id')
  async updateCarousel(@Param('id') id: string, @Body() carouselDto: CarouselDto, @Res() res: any) {
    try {
      const updated = await this.GemsPackageService.updateCarousel(id, carouselDto);
      if (updated) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '3341',
          data: {
            _id: (updated as any).id,
            updatedAt: (updated as any).updatedAt,
          }
        }, '3341');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      console.log('e===>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Delete('carousel/:id')
  async deleteCarousel(@Param('id') id: string, @Res() res: any) {
    try {
      const deleted = await this.GemsPackageService.deleteCarouselById(id);
      if (deleted) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '3342', data: { _id: (deleted as any).id } }, '3342');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
