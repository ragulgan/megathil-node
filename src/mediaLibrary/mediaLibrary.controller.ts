import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { MediaLibraryService } from './mediaLibrary.service';
import { CreateMediaLibraryDto } from './dto/createMediaLibrary.dto';
import { UpdatedMediaLibraryDto } from './dto/updateMediaLibrary.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard, SuperAdminGuard, UserAdminGuard, StaffAdminGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { MediaLibrary } from './mediaLibrary.schema';
const { ERROR, SUCCESS } = appConst;
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { CreateMediaLikesDto } from './dto/createMediaLikes.dto';
import { verifyAndExtractToken } from 'src/utill/utill';


@ApiTags('MediaLibrary')
@Controller('mediaLibrary')
export class MediaLibraryController {
  constructor(
    private readonly MediaLibraryService: MediaLibraryService,
    private readonly responseService: ResponseService,
    @InjectModel(MediaLibrary.name) private MediaLibraryModel: Model<MediaLibrary>,
  ) { }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createMediaLibraryDto: CreateMediaLibraryDto, @Res() res: Response) {
    try {
      const createdMediaLibrary = await this.MediaLibraryService.create(
        createMediaLibraryDto
      )
      if (createdMediaLibrary) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1032',
          data: {
            _id: (createdMediaLibrary as any).id,
            createdAt: (createdMediaLibrary as any).createdAt,
          }
        }, '1032');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    }
    catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'title', required: false, description: 'Return Based on title' })
  @ApiQuery({ name: 'category', required: false, description: 'Return Based on category' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @ApiQuery({ name: 'libraryStatus', required: false, description: 'Return Based on libraryStatus' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const result = await this.MediaLibraryService.findAll(queryParams, decodedToken.id);
      if (!_.isEmpty(result && result.MediaLibraryList)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: result.MediaLibraryList,
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


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByStudent = await this.MediaLibraryService.findById(id)
      if (getByStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByStudent
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatedMediaLibraryDto: UpdatedMediaLibraryDto, @Res() res: any) {
    try {
      const updateStudent = await this.MediaLibraryService.update(id, updatedMediaLibraryDto);
      if (updateStudent) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1033',
          data: {
            _id: (updateStudent as any).id,
            updatedAt: (updateStudent as any).updatedAt,
          }
        }, '1033');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(StaffAdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteMediaLibrary = await this.MediaLibraryService.delete(id);
      if (deleteMediaLibrary) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1034', data: { _id: (deleteMediaLibrary as any).id } }, '1034');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }


  @UseGuards(UserAdminGuard)
  @ApiBearerAuth()
  @Post('user/likeid:mediaId')
  async mediaLikes(@Param('mediaId') id: string, @Request() req, @Res() res: any) {
    const decodedToken = verifyAndExtractToken(req.headers);
    try {
      const addMediaLikes = await this.MediaLibraryService.mediaLikes(id, decodedToken.id);
      if (addMediaLikes) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: addMediaLikes.like === "like" ? '4230' : "4231", }, addMediaLikes.like === "like" ? '4230' : "4231");
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
      }
    } catch {
      throw new BadRequestException();
    }
  }
}
