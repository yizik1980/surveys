import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/login')
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id, req.user.role);
  }
}
