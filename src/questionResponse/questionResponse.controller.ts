import { Body, Controller, Get, Post, Query, Res, BadRequestException, Request, Param, UseGuards } from '@nestjs/common';
import { QuestionResponseService } from './questionResponse.service';
import { CreateQuestionResponseDto } from './dto/createQuestionResponse.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard, UserStaffAdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import { verifyAndExtractToken } from 'src/utill/utill';
import type { Response as EResponse } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('QuestionResponse')
@Controller('questionResponse')
export class QuestionResponseController {
  constructor(
    private readonly QuestionResponseService: QuestionResponseService,
    private readonly responseService: ResponseService,
  ) { }

  // this endpoint handles the question response
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async processUserAnswers(@Body() createQuestionResponseDto: CreateQuestionResponseDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const createdQuestionResponse = await this.QuestionResponseService.processUserAnswers(createQuestionResponseDto, decodedToken.id, decodedToken);
      if (createdQuestionResponse) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1047',
          data: {
            _id: (createdQuestionResponse as any).id,
            createdAt: (createdQuestionResponse as any).createdAt,
            userProgressStatusId: (createdQuestionResponse as any).userProgressStatusId,

          }
        }, '1047');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1049' }, '1049');
      }
    } catch (e) {
      console.log("Error:", e);
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, e.message, '1003');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'parentOptionId', required: false, })
  @ApiQuery({ name: 'questionId', required: false, })
  @ApiQuery({ name: 'moduleId', required: true, })
  @ApiQuery({ name: 'unitId', required: true, })
  @ApiQuery({ name: 'userId', required: true, })
  @ApiQuery({ name: 'attempt', required: false, })
  @ApiQuery({ name: 'attemptDate', required: false, })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getQuestionResponse = await this.QuestionResponseService.findAll(queryParams);
      if (getQuestionResponse) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getQuestionResponse.QuestionResponseList,
          // count: getQuestionResponse.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get('user/:userId')
  async getUserResponses(@Param('userId') userId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getQuestionResponse = await this.QuestionResponseService.findUserResponses(userId, queryParams);
      if (getQuestionResponse) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getQuestionResponse.QuestionResponseList,
          count: getQuestionResponse.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: 0 }, '1005')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post('/reissue-certificate/:userId')
  async reissueCertificate(@Param('userId') userId: string, @Res() res: any) {
    try {
      const userCertificateData: any = await this.QuestionResponseService.certificateReIssue(userId);
      if (userCertificateData) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '5111',
          data: {
            status: userCertificateData.status
          }
        }, '5111');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5112', data: [], count: 0 }, '5112')
      }
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get('certificate/read/:userId')
  async streamCertificate(@Param('userId') userId: string, @Res() res: EResponse) {
    try {
      const result = await this.QuestionResponseService.checkCompletionAndStreamCertificate(userId);
      if (result.success && result.filePath) {
        const filePath = result.filePath;

        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          const filename = path.basename(filePath);
          res.setHeader('Content-Length', stat.size);
          // res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Disposition', `inline`);
          res.setHeader('Content-Type', 'image/png');

          const stream = fs.createReadStream(filePath);
          return stream.pipe(res);
        } else {
          return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5113' }, '5113');
        }
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5112' }, '5112')
      }
    } catch (error) {
      console.error('Error streaming certificate:', error);
      return this.responseService.sendResponse({}, res, 500, { code: '5000' }, 'Internal Server Error');
    }
  }

}
