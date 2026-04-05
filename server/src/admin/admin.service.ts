import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';
import { SurveyorsService } from '../surveyors/surveyors.service';
import { CreateSurveyorDto } from '../surveyors/dto/create-surveyor.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private surveyorsService: SurveyorsService,
  ) {}

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id).select('-password');
    if (!admin) throw new NotFoundException('אדמין לא נמצא');
    return admin;
  }

  // ─── Surveyors CRUD (delegated to SurveyorsService) ───────────────────────

  getSurveyors(search?: string) {
    return this.surveyorsService.findAll(search);
  }

  getSurveyor(id: string) {
    return this.surveyorsService.findById(id);
  }

  createSurveyor(dto: CreateSurveyorDto) {
    return this.surveyorsService.create(dto);
  }

  updateSurveyor(id: string, dto: Partial<CreateSurveyorDto>) {
    return this.surveyorsService.update(id, dto);
  }

  deleteSurveyor(id: string) {
    return this.surveyorsService.remove(id);
  }

  getSurveyorStats() {
    return this.surveyorsService.getStats();
  }
}
