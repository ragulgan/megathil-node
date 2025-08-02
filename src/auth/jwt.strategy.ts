import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, 
      // secretOrKey: 'secretKey', 
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUserByEmail(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: payload.userId, role: payload.role }
  }
}
