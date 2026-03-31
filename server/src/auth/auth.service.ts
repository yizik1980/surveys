import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AdminService } from '../admin/admin.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const token = this.signToken(user._id.toString(), user.email, user.role);
    return {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('אימייל או סיסמה שגויים');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('אימייל או סיסמה שגויים');

    if (!user.isActive) throw new UnauthorizedException('המשתמש אינו פעיל');

    const token = this.signToken(user._id.toString(), user.email, user.role);
    return {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  async loginAdmin(dto: LoginDto) {
    const admin = await this.adminService.findByEmail(dto.email);
    if (!admin) throw new UnauthorizedException('אימייל או סיסמה שגויים');

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) throw new UnauthorizedException('אימייל או סיסמה שגויים');

    if (!admin.isActive) throw new UnauthorizedException('חשבון האדמין אינו פעיל');

    const token = this.signToken(admin._id.toString(), admin.email, 'admin');
    return {
      token,
      user: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: 'admin',
      },
    };
  }

  async getMe(userId: string, role: string) {
    if (role === 'admin') {
      const admin = await this.adminService.findById(userId);
      return {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: 'admin',
      };
    }

    const user = await this.usersService.findById(userId);
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      companyName: user.companyName,
      jobTitle: user.jobTitle,
    };
  }

  private signToken(sub: string, email: string, role: string) {
    return this.jwtService.sign({ sub, email, role });
  }
}
