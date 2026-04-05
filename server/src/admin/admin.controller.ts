import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateSurveyorDto } from '../surveyors/dto/create-surveyor.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('surveyors')
  getSurveyors(@Query('search') search?: string) {
    return this.adminService.getSurveyors(search);
  }

  @Get('surveyors/stats')
  getSurveyorStats() {
    return this.adminService.getSurveyorStats();
  }

  @Get('surveyors/:id')
  getSurveyor(@Param('id') id: string) {
    return this.adminService.getSurveyor(id);
  }

  @Post('surveyors')
  createSurveyor(@Body() dto: CreateSurveyorDto) {
    return this.adminService.createSurveyor(dto);
  }

  @Put('surveyors/:id')
  updateSurveyor(@Param('id') id: string, @Body() dto: Partial<CreateSurveyorDto>) {
    return this.adminService.updateSurveyor(id, dto);
  }

  @Delete('surveyors/:id')
  deleteSurveyor(@Param('id') id: string) {
    return this.adminService.deleteSurveyor(id);
  }
}
