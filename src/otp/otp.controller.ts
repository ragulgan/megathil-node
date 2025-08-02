import { Controller, Get, Query, Res, BadRequestException, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ResponseService } from '../base/controller';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly OtpService: OtpService,
    private readonly responseService: ResponseService,
  ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
      try {
        const getOtp = await this.OtpService.findAll(queryParams);
        if (!_.isEmpty(getOtp.OtpList)) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '1004',
            data: getOtp.OtpList,
            count: getOtp.count
          }, '1004');
        }
        else {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getOtp.count }, '1005')
        }
      } catch {
        throw new BadRequestException();
      }
    }
}
