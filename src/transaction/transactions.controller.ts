import { Body, Controller, Get, Post, Query, Res, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { UsersService } from 'src/users/users.service';
import { CreateTransactionDto } from './dto/createTransactions.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard, UserAdminGuard, UserStaffAdminGuard } from '../auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { verifyAndExtractToken } from '../utill/utill';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly TransactionService: TransactionService,
    private readonly responseService: ResponseService,
    private readonly usersService: UsersService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto, @Res() res: Response, @Request() req) {
    const decodedToken = verifyAndExtractToken(req.headers);

    try {
      const createdTransaction = await this.TransactionService.create(createTransactionDto, decodedToken.id);
      if (createdTransaction) {
        if (createdTransaction.status == 'SUCCESS') {
          await this.usersService.updateLMSTopicsToUserModel(createdTransaction.userId, createdTransaction.topicId);
        }
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '2005',
          data: {
            _id: (createdTransaction as any).id,
            createdAt: (createdTransaction as any).createdAt,
          }
        }, '2005');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, })
  @ApiQuery({ name: 'id', required: false, description: '_id' })
  @ApiQuery({ name: 'transactionFrom', required: false, description: 'transactionFrom' })
  @ApiQuery({ name: 'transactionTo', required: false, description: 'transactionTo' })
  @ApiQuery({ name: 'userId', required: false, description: 'userId' })
  @ApiQuery({ name: 'lastName', required: false, description: 'lastName' })
  @ApiQuery({ name: 'firstName', required: false, description: 'firstName' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getTransaction = await this.TransactionService.findAll(queryParams);
      if (!_.isEmpty(getTransaction.TransactionList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getTransaction.TransactionList,
          count: getTransaction.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getTransaction.count }, '1005')
      }
    } catch (e) {
      console.log("Error:", e);
      throw new BadRequestException();
    }
  }
}
