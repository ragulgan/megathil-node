import { BadRequestException, Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateMobilecodeDto } from './dto/createMobilecode-json.dto';
import { MobilecodeJsonService } from './mobilecode-json.service';
import { ResponseService } from 'src/base/controller';
import { AdminGuard } from 'src/auth/jwt-auth.guard';
import { appConst } from '../libs/constants';
import * as _ from 'lodash';
const { ERROR, SUCCESS } = appConst;

@ApiTags('mobilecode-json')
@Controller('mobilecode-json')
export class MobilecodeJsonController {
 constructor(
  private readonly MobilecodeService: MobilecodeJsonService,
  private readonly responseService: ResponseService,
 ) {
  
 }

 @UseGuards(AdminGuard)
 @ApiBearerAuth()
 @Post()
 async create(@Body() createMobilecodeDto: CreateMobilecodeDto, @Res() res: Response) {
  try {
  const getMobilecode = await this.MobilecodeService.getMobilecodeId();
   const createdMobileCode = await this.MobilecodeService.createMobileCodeJson(getMobilecode, createMobilecodeDto);
   if (createdMobileCode) {
    this.responseService.sendResponse({}, res, SUCCESS.CODE, {
     code: '7112',
     data: {
      _id: (createdMobileCode as any).id,
      createdAt: (createdMobileCode as any).createdAt,
     }
    }, '7112');
   }
   else {
    this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
   }
  } catch (e) {
   throw new BadRequestException();
  }
 }

 @ApiQuery({ name: 'mobilecodeJson', required: false, description: 'Return Based on MobileCodeJson' })
  @Get()
  async findAll(@Res() res: any) {
    try {
      const getMobileCode = await this.MobilecodeService.findAll();
      if (!_.isEmpty(getMobileCode.MobilecodeList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getMobileCode.MobilecodeList
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getMobileCode.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }
}
