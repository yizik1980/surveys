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
  Request,
} from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { AssignSurveyDto } from './dto/assign-survey.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  // Public - access survey by token (for surveyed users)
  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.surveysService.findByToken(token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles('admin', 'surveyor')
  findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.surveysService.findAll(req.user.id, req.user.role, {
      status,
      search,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  @Roles('admin', 'surveyor')
  getStats(@Request() req) {
    return this.surveysService.getStats(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles('admin', 'surveyor')
  findOne(@Param('id') id: string) {
    return this.surveysService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('admin', 'surveyor')
  create(@Body() dto: CreateSurveyDto, @Request() req) {
    return this.surveysService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles('admin', 'surveyor')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSurveyDto>, @Request() req) {
    return this.surveysService.update(id, dto, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('admin', 'surveyor')
  remove(@Param('id') id: string, @Request() req) {
    return this.surveysService.remove(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/assign')
  @Roles('admin', 'surveyor')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignSurveyDto,
    @Request() req,
  ) {
    return this.surveysService.assignToUsers(id, dto, req.user.id, req.user.role);
  }
}
