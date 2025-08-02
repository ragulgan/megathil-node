import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './service';
import { CreateRoleDto } from './dto/create.dto';
import { UpdateRoleDto } from './dto/update.dto ';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { count } from 'console';
const { ERROR, SUCCESS } = appConst;



@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly RoleService: RoleService, private readonly responseService: ResponseService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto, @Res() res: Response) {
    try {
      const exist = await this.RoleService.findByRole(createRoleDto.role, createRoleDto.displayName);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1132' }, '1132');
        return;
      }
      const createRole = await this.RoleService.create(createRoleDto);
      if (createRole) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1029',
          data: {
            _id: (createRole as any).id,
            createdAt: (createRole as any).createdAt,
          }
        }, '1029');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'role', required: false, description: 'Return Based on role' })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on role' })
  @Get()
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getRole = await this.RoleService.findAll(queryParams);
      if (getRole) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getRole.roleList,
          count: getRole.count
        }, '1004');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getRole.count }, '1005')
      }
    } catch (e) {
      console.log("Error#", e)
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findById(@Param('id') id: string, @Res() res: any) {
    try {
      const getByRole = await this.RoleService.findById(id)
      if (getByRole) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1004',
          data: getByRole
        }, '1004');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Res() res: any) {
    try {
      const exist = await this.RoleService.findByRoleButId(updateRoleDto.role, updateRoleDto.displayName, id);
      if (exist) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1132' }, '1132');
        return;
      }
      const updateRole = await this.RoleService.update(id, updateRoleDto);
      if (updateRole) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1030',
          data: {
            _id: (updateRole as any).id,
            updatedAt: (updateRole as any).updatedAt,
            role: (updateRole as any).role,
            status: (updateRole as any).status,
          }
        }, '1030');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any) {
    try {
      const deleteRole = await this.RoleService.delete(id);
      if (deleteRole) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1031', data: { _id: (deleteRole as any).id } }, '1031');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
      }
    } catch {
      throw new BadRequestException();
    }
  }

}
