import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Surveyor, SurveyorDocument } from './surveyor.schema';
import { CreateSurveyorDto } from './dto/create-surveyor.dto';
import { RegisterSurveyorDto } from './dto/register-surveyor.dto';
import { PRICING } from '../const/pricing';

@Injectable()
export class SurveyorsService {
  constructor(
    @InjectModel(Surveyor.name) private surveyorModel: Model<SurveyorDocument>,
  ) {}

  async register(dto: RegisterSurveyorDto): Promise<SurveyorDocument> {
    const exists = await this.surveyorModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('כתובת המייל כבר קיימת במערכת');

    const hashed = await bcrypt.hash(dto.password, 10);
    const PRICES = { monthly: PRICING.monthly.pricePerMonth, annual: PRICING.annual.pricePerMonth };
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (dto.subscription.plan === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const surveyor = new this.surveyorModel({
      ...dto,
      password: hashed,
      subscription: {
        plan: dto.subscription.plan,
        status: 'active',
        pricePerMonth: PRICES[dto.subscription.plan],
        startDate,
        endDate,
      },
    });
    return surveyor.save();
  }

  async create(dto: CreateSurveyorDto): Promise<SurveyorDocument> {
    const exists = await this.surveyorModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('כתובת המייל כבר קיימת במערכת');
    const hashed = await bcrypt.hash(dto.password, 10);
    const surveyor = new this.surveyorModel({ ...dto, password: hashed });
    return surveyor.save();
  }

  findAll(search?: string) {
    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }
    return this.surveyorModel.find(query).select('-password').lean();
  }

  async findById(id: string): Promise<SurveyorDocument> {
    const s = await this.surveyorModel.findById(id).select('-password');
    if (!s) throw new NotFoundException('סוקר לא נמצא');
    return s;
  }

  async findByEmail(email: string): Promise<SurveyorDocument | null> {
    return this.surveyorModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, dto: Partial<CreateSurveyorDto>): Promise<SurveyorDocument> {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const s = await this.surveyorModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password');
    if (!s) throw new NotFoundException('סוקר לא נמצא');
    return s;
  }

  async remove(id: string): Promise<void> {
    const result = await this.surveyorModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('סוקר לא נמצא');
  }

  async getStats() {
    const total = await this.surveyorModel.countDocuments();
    const byPlan = await this.surveyorModel.aggregate([
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
    ]);
    const byStatus = await this.surveyorModel.aggregate([
      { $group: { _id: '$subscription.status', count: { $sum: 1 } } },
    ]);
    return { total, byPlan, byStatus };
  }
}
