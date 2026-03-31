import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.schema';
import { CreateSurveyorDto } from './dto/create-surveyor.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private usersService: UsersService,
  ) {}

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id).select('-password');
    if (!admin) throw new NotFoundException('אדמין לא נמצא');
    return admin;
  }

  // Surveyors CRM
  getSurveyors(search?: string) {
    return this.usersService.findAll({ role: UserRole.SURVEYOR, search });
  }

  getSurveyor(id: string) {
    return this.usersService.findById(id);
  }

  createSurveyor(dto: CreateSurveyorDto) {
    return this.usersService.create({ ...dto, role: UserRole.SURVEYOR });
  }

  updateSurveyor(id: string, dto: Partial<CreateSurveyorDto>) {
    return this.usersService.update(id, dto);
  }

  deleteSurveyor(id: string) {
    return this.usersService.remove(id);
  }
}
