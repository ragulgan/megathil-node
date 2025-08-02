import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { InterviewerService } from '../interviewer/interviewer.service';
import { ResponseService } from 'src/base/controller';
import * as moment from 'moment';
import { AdminGuard, InterviewerGuard, SuperAdminGuard, UserGuard } from 'src/auth/jwt-auth.guard';
import { appConst } from 'src/libs/constants';
import { InterviewerAvailabilityDto } from './dto/interviewerAvailability.dto';
import { verifyAndExtractToken } from 'src/utill/utill';
import { ApplyDto } from './dto/apply.dto';
import { CancelDto } from './dto/cancel.dto';
import { AcceptDto } from './dto/accept.dto';
import { HolidayDto } from './dto/holiday.dto';
import * as _ from 'lodash';
import { CompleteDto } from './dto/complete.dto';
import { ReviewDto } from './dto/review.dto';
const { ERROR, SUCCESS } = appConst;

@ApiTags('Interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(
    private readonly interviewService: InterviewsService,
    private readonly responseService: ResponseService,
    private readonly interviewerService: InterviewerService,
  ) { }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/availability')
  async addAvailability(@Body() interviewerAvailabilityDto: InterviewerAvailabilityDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const availabilitySaved: any = await this.interviewService.saveAvailability(interviewerAvailabilityDto, decodedToken.id);
      if (availabilitySaved.status === 'success') {
        await this.interviewerService.handleInterviewRequestAction(decodedToken, "availability")
        return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: availabilitySaved.code, data: availabilitySaved.data }, availabilitySaved.code);
      } else {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: availabilitySaved.code, data: availabilitySaved.data }, availabilitySaved.code);
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'toDate', required: false, description: 'To date' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'From date' })
  @Get('interviewer/availability')
  async listInterviewerAvailabilities(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const interviewerAvailabilities = await this.interviewService.getInterviewerAvailabilities(queryParams, decodedToken.id);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        count: interviewerAvailabilities.length,
        data: interviewerAvailabilities,
      }, '1004');
    } catch (e) {
      console.log("Error gettering interviewer availabilities:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('admin/interviewer/availability/:interviewerId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async listAdminInterviewerAvailabilities(@Param('interviewerId') interviewerId: string, @Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const isExist = await this.interviewerService.findById(interviewerId);
      if (!_.isEmpty(isExist)) {
        const { interviewerAvailabilities, count } = await this.interviewService.getAdminInterviewerAvailabilities(interviewerId, queryParams);
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          count: count,
          data: interviewerAvailabilities,
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('admin/interviewer/bookingRequests/:interviewerId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async getAdminInterviewerBookingRequests(@Query() queryParams: any, @Param('interviewerId') interviewerId: string, @Res() res: any) {
    try {
      const isExist = await this.interviewerService.findById(interviewerId);
      if (!_.isEmpty(isExist)) {
        const bookingRequests = await this.interviewService.getBookingRequestsForInterviewer(queryParams, interviewerId);
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          count: bookingRequests.length,
          data: bookingRequests,
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('admin/interviewer/acceptedBookings/:interviewerId')
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  async getAdminInterviewerAcceptedBookings(@Query() queryParams: any, @Param('interviewerId') interviewerId: string, @Res() res: any) {
    try {
      const result = await this.interviewService.getBookingsForInterviewer(queryParams, interviewerId);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        count: result.count,
        data: result.bookingRequests,
      }, '1004');
    } catch (e) {
      throw new BadRequestException();
    }
  }


  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Get('interviewer/bookingRequests')
  async getInterviewerBookingRequests(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingRequests = await this.interviewService.getBookingRequestsForInterviewer(queryParams, decodedToken.id);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        count: bookingRequests.length,
        data: bookingRequests,
      }, '1004');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Get('interviewer/bookings')
  async getInterviewerAcceptedBookings(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const result = await this.interviewService.getBookingsForInterviewer(queryParams, decodedToken.id);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        count: result.count,
        data: result.bookingRequests,
      }, '1004');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'toDate', required: false, description: 'To date' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'From date' })
  @ApiQuery({ name: 'interviewerId', required: false, description: 'Interviewer ID' })
  @Get()
  async findAll(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const availabilities = await this.interviewService.getAllInterviews(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: availabilities,
        count: availabilities.length
      }, '1004');
    } catch (e) {
      console.log("Error#", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'type', required: false, description: 'Type' })
  @ApiQuery({ name: 'toDate', required: false, description: 'To date' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'From date' })
  @ApiQuery({ name: 'scheduleName', required: false, description: 'Filter by scheduleName' })
  @ApiQuery({ name: 'interviewer', required: false, description: 'Filter by interviewer' })
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get('admin/list/availabilities')
  async findAllAvailabilities(@Query() queryParams: { limit?: number; skip?: number }, @Request() req, @Res() res: any) {
    try {
      const { availabilities, count } = await this.interviewService.getAllAvailabilitiesForAdmin(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: availabilities,
        count: count
      }, '1004');
    } catch (e) {
      console.log("Error#", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'rescheduleStartDate', required: false, })
  @ApiQuery({ name: 'interviewerId', required: false, description: 'Filter by interviewerId' })
  @Get('availableForUserBooking')
  async findAllOpenInterviews(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const { interviews, count } = await this.interviewService.getAvailabilityForUsers(queryParams);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: interviews,
        count: count
      }, '1004');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Post('user/apply')
  async applyForInterview(@Body() applyDto: ApplyDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      if (!applyDto.bookingId) {
        const gems = await this.interviewService.findGemsByName('BOOK_INTERVIEW');
        if (!gems) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5050' }, '5050');
        }

        const user = await this.interviewService.findUserById(decodedToken.id);
        if (!user) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5040' }, '5040');
        }

        if (!user.allowMockInterview) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5058' }, '5058');
        }

        if (user.gemValue < gems.value) {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5051' }, '5051');
        }

      }

      const availabilityData = await this.interviewService.getAvailabilityById(applyDto.availabilityId);
      if (!availabilityData) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4232' }, '4232');
      }

      const existingBooking: any = await this.interviewService.getBookingByAvailabilityId(applyDto);
      if (!_.isEmpty(existingBooking)) {
        if (applyDto.bookingId) {
          if (existingBooking.rescheduledCount >= 1) {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4243' }, '4243');
          }
        }

        if (existingBooking &&
          existingBooking.user &&
          existingBooking.user._id.toString() === decodedToken.id.toString() &&
          (existingBooking.status === 'PENDING' || existingBooking.status === 'RESCHEDULED')) {
          return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4204' }, '4204');
        } else if (existingBooking &&
          existingBooking.user &&
          existingBooking.user._id.toString() === decodedToken.id.toString()) {
          return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4234' }, '4234');
        } else {
          return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4203' }, '4203');
        }
      }

      const slots = availabilityData.slots;
      const slot = availabilityData.slots.find((item) => item.slotStartTime === applyDto.startDateTime && item.slotEndTime === applyDto.endDateTime);

      if (!slot) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4233' }, '4233');
      }

      const booked = await this.interviewService.saveUserBooking(applyDto, decodedToken.id, slots);
      if (booked && booked.id && applyDto.bookingId) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4244', data: { bookingId: booked.id } }, '4244');
      } else if (booked && booked.id) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4201', data: { bookingId: booked.id } }, '4201');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '500' }, '500');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('reschedule')
  async getInterviewerReschedule(@Body() applyDto: ApplyDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      if (!decodedToken) {
        throw new BadRequestException();
      }
      const availabilityData = await this.interviewService.getInterviewerAvailabilityById(applyDto.availabilityId, decodedToken.id);
      if (!availabilityData) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4232' }, '4232');
      }
      const conflictingBooking: any = await this.interviewService.getInterviewerBooking(applyDto);
      if (conflictingBooking) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4234' }, '4234');
      }
      const slots = availabilityData.slots;
      const slot = availabilityData.slots.find((item) => item.slotStartTime === applyDto.startDateTime && item.slotEndTime === applyDto.endDateTime);
      if (!slot) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4233' }, '4233');
      }
      if (!_.isEmpty(conflictingBooking)) {
        const booked = await this.interviewService.saveResheduleBooking(applyDto, slots);
        if (booked && booked.id) {
          this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5100', data: { bookingId: booked.id } }, '5100');
        } else {
          this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '500' }, '500');
        }
      }
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get('user/pastbookings')
  async getUserPastBookings(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const { interviews, count } = await this.interviewService.findUserPastBookings(queryParams, decodedToken.id);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: interviews,
        count: count
      }, '1004');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @Get('user/upcomingInterviews')
  async getUserUpcomingInterviews(@Query() queryParams: any, @Request() req, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const { interviews, count } = await this.interviewService.findUserUpcomingInterviews(queryParams, decodedToken.id);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1004',
        data: interviews,
        count: count
      }, '1004');
    } catch (e) {
      console.log("Error:", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Post('user/cancel')
  async cancelUserInterview(@Body() cancelDto: CancelDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingData = await this.interviewService.getBookingById(cancelDto.bookingId);
      if (!bookingData) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4228' }, '4228');
      }
      if (bookingData && bookingData.user && bookingData.user.toString() !== decodedToken.id) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4208' }, '4208');
      }
      if (bookingData.status === 'CANCELED_BY_INTERVIEWER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4218' }, '4218');
      }
      if (bookingData.status === 'CANCELED_BY_USER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4219' }, '4219');
      }
      if (bookingData.status === 'COMPLETED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4207' }, '4207');
      }
      const booked = await this.interviewService.cancelBookingByUser(cancelDto);
      if (booked && booked.modifiedCount > 0) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4229', data: {} }, '4229');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4203' }, '4203');
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/accept')
  async acceptInterview(@Body() acceptDto: AcceptDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingData: any = await this.interviewService.getBookingById(acceptDto.bookingId);
      if (bookingData && bookingData.availabilityId && bookingData.availabilityId?.interviewer?.toString() !== decodedToken.id) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.UNAUTHORIZED, { code: '4208' }, '4208');
      }
      if (bookingData.status === 'ACCEPTED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4206' }, '4206');
      }
      if (bookingData.status === 'COMPLETED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4207' }, '4207');
      }
      const booked = await this.interviewService.acceptUserBookingByInterviewer(acceptDto);
      if (booked && booked.modifiedCount > 0) {
        await this.interviewerService.handleInterviewRequestAction(decodedToken, "accepted")
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4209', data: {} }, '4209');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4213' }, '4213');
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/reject')
  async rejectInterview(@Body() cancelDto: CancelDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingData: any = await this.interviewService.getBookingById(cancelDto.bookingId);
      if (bookingData && bookingData.availabilityId && bookingData.availabilityId?.interviewer?.toString() !== decodedToken.id) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.UNAUTHORIZED, { code: '4208' }, '4208');
      }
      if (bookingData.status === 'CANCELED_BY_USER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4220' }, '4220');
      }
      if (bookingData.status === 'REJECTED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4212' }, '4212');
      }
      if (bookingData.status === 'COMPLETED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4207' }, '4207');
      }
      const booked = await this.interviewService.rejectUserBookingByInterviewer(cancelDto);
      if (booked && booked.modifiedCount > 0) {
        await this.interviewerService.handleInterviewRequestAction(decodedToken, "rejected")
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4214', data: {} }, '4214');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4213' }, '4213');
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/complete')
  async completeInterview(@Body() completeDto: CompleteDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingData: any = await this.interviewService.getBookingById(completeDto.bookingId);
      if (bookingData && bookingData.availabilityId && bookingData.availabilityId?.interviewer?.toString() !== decodedToken.id) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.UNAUTHORIZED, { code: '4208' }, '4208');
      }
      if (bookingData.status === 'PENDING') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4240' }, '4240');
      }
      if (bookingData.status === 'REJECTED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4212' }, '4212');
      }
      if (bookingData.status === 'CANCELED_BY_USER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4220' }, '4220');
      }
      if (bookingData.status === 'CANCELED_BY_INTERVIEWER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4219' }, '4219');
      }

      const completed = await this.interviewService.completeUserBookingByInterviewer(completeDto);
      if (completed && completed.modifiedCount > 0) {
        await this.interviewerService.handleInterviewRequestAction(decodedToken, "completed")
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4241', data: {} }, '4241');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4242' }, '4242');
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }


  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/cancel')
  async cancelInterview(@Body() cancelDto: CancelDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingData: any = await this.interviewService.getBookingById(cancelDto.bookingId);
      if (bookingData && bookingData.availabilityId && bookingData.availabilityId?.interviewer?.toString() !== decodedToken.id) {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.UNAUTHORIZED, { code: '4208' }, '4208');
      }
      if (bookingData.status === 'REJECTED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4212' }, '4212');
      }
      if (bookingData.status === 'CANCELED_BY_USER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4220' }, '4220');
      }
      if (bookingData.status === 'CANCELED_BY_INTERVIEWER') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.ALREADY_EXIST, { code: '4219' }, '4219');
      }
      if (bookingData.status === 'COMPLETED') {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4207' }, '4207');
      }
      const booked = await this.interviewService.cancelUserBookingByInterviewer(cancelDto);
      if (booked && booked.modifiedCount > 0) {
        await this.interviewerService.handleInterviewRequestAction(decodedToken, "cancelled")
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4216', data: {} }, '4216');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4217' }, '4217');
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/leave')
  async addInterviewerLeave(@Body() holidayDto: HolidayDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const result = await this.interviewService.saveInterviewerLeave(holidayDto, decodedToken.id);
      if (result.status === 'success') {
        await this.interviewerService.handleInterviewRequestAction(decodedToken, "leave")
        return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '4252' }, '4252');
      } else {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result.code, data: result.data }, result.code);
      }
    } catch (e) {
      console.log("Error#", e)
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post('admin/holiday')
  async addHoliday(@Body() holidayDto: HolidayDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const holidaysSaved = await this.interviewService.saveHoliday(holidayDto, decodedToken.id);
      if (holidaysSaved.status === 'success') {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: holidaysSaved.code, data: holidaysSaved }, holidaysSaved.code);
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: holidaysSaved.code }, holidaysSaved.code);
      }
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @Delete('harddelete/:availabilityId')
  async delete(@Param('availabilityId') availabilityId: string, @Res() res: any) {
    try {
      const deleteInterviewer = await this.interviewService.hardDeleteAvailabilityById(availabilityId);
      if (deleteInterviewer) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '202', data: { _id: (deleteInterviewer as any).id } }, '202');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Get('bookings/count')
  async getBookingCounts(@Request() req: any, @Res() res: any) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const bookingsCount = await this.interviewService.getBookingCountsForInterviewer(decodedToken.id, decodedToken.role);
      if (bookingsCount) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: bookingsCount }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Get('interviewer/availability/:frequencyId')
  async getFrequencyIdCounts(@Param('frequencyId') frequencyId: string, @Res() res: any, @Request() req: any) {
    try {
      const getfrequencyIdValue = await this.interviewService.getfrequencyIdData(frequencyId);
      if (getfrequencyIdValue) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: getfrequencyIdValue }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Post('user/review')
  async addUserReview(@Body() reviewDto: ReviewDto, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const result = await this.interviewService.saveUserReview(reviewDto, decodedToken.id);
      if (result) {
        return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '5052' }, '5052');
      } else {
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5053' }, '5053');
      }
    } catch (e) {
      console.log("Error#", e)
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
    }
  }

  // this api created for testing overlap scenario not for client use
  @UseGuards(InterviewerGuard)
  @ApiBearerAuth()
  @Post('interviewer/checkoverlap')
  async checkOverlap(@Body() overlapDto: any, @Request() req: any, @Res() res: Response) {
    try {
      const decodedToken = verifyAndExtractToken(req.headers);
      const availabilitySaved: any = await this.interviewService.checkOverlap(overlapDto, decodedToken.id);
      return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: "200", data: availabilitySaved }, "200");
    } catch (e) {
      console.log("error", e)
      throw new BadRequestException();
    }
  }


}
