import { Body, Controller, Get, Query, Res, BadRequestException, UseGuards } from '@nestjs/common';
import { LoginHistoryService } from './service';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { count } from 'console';
const { ERROR, SUCCESS } = appConst;


@ApiTags('LoginHistory')
@Controller('loginHistory')
export class LoginHistoryController {
  constructor(private readonly LoginHistoryService: LoginHistoryService, private readonly responseService: ResponseService) { }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on LoginHistory' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getLoginHistory = await this.LoginHistoryService.findAll(queryParams);
      if (getLoginHistory) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getLoginHistory.LoginHistoryList,
          count: getLoginHistory.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getLoginHistory.count }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
