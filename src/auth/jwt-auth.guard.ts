import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { extractTokenFromHeaders } from '../utill/utill';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (_.isEmpty(decoded)) {
        throw new UnauthorizedException('Invalid token');
      }
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.role
      return userRole === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'USER';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'STAFF';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class InterviewerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'INTERVIEWER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}


@Injectable()
export class UserAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'USER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class UserStaffAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      console.log("role$$", decoded.role);
      return decoded.role === 'USER' || decoded.role === 'STAFF' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class StaffAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'STAFF' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class InterviewerAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'INTERVIEWER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class PromotorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'PROMOTOR';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class PromotorAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.role === 'PROMOTOR' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

