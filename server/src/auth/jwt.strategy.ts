import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { AdminService } from '../admin/admin.service';
import { SurveyorsService } from '../surveyors/surveyors.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
    private surveyorsService: SurveyorsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'surveys-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role === 'admin') {
      try {
        const admin = await this.adminService.findById(payload.sub);
        if (!admin.isActive) throw new UnauthorizedException();
      } catch {
        throw new UnauthorizedException();
      }
    } else if (payload.role === 'surveyor') {
      const surveyor = await this.surveyorsService.findById(payload.sub);
      if (!surveyor || !surveyor.isActive) throw new UnauthorizedException();
    } else {
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
