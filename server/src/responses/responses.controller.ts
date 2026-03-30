import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  // Public - submit survey response via token
  @Post()
  submit(@Body() dto: SubmitResponseDto) {
    return this.responsesService.submit(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('survey/:id')
  @Roles('admin', 'surveyor')
  findBySurvey(@Param('id') id: string) {
    return this.responsesService.findBySurvey(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('survey/:id/stats')
  @Roles('admin', 'surveyor')
  getSurveyStats(@Param('id') id: string) {
    return this.responsesService.getSurveyStats(id);
  }
}
