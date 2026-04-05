import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Survey, SurveyDocument, SurveyStatus } from './survey.schema';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { AssignSurveyDto } from './dto/assign-survey.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SurveysService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateSurveyDto, creatorId: string): Promise<SurveyDocument> {
    const questions = (dto.questions ?? []).filter((q) => q.text?.trim());
    const survey = new this.surveyModel({ ...dto, questions, creator: creatorId });
    return survey.save();
  }

  async findAll(userId: string, role: string, filters?: any) {
    const query: any = {};
    if (role === 'surveyor') {
      query.$or = [
        { creator: new Types.ObjectId(userId) },
        { 'creator._id': userId },
      ];
    }
    if (filters?.status) query.status = filters.status;
    if (filters?.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }
    return this.surveyModel
      .find(query)
      .populate('creator', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id: string): Promise<SurveyDocument> {
    const survey = await this.surveyModel
      .findById(id)
      .populate('creator', 'firstName lastName email');
    if (!survey) throw new NotFoundException('סקר לא נמצא');
    return survey;
  }

  async findByToken(token: string) {
    const survey = await this.surveyModel.findOne({
      'assignedUsers.token': token,
      status: SurveyStatus.ACTIVE,
    });
    if (!survey) throw new NotFoundException('קישור הסקר אינו תקף');

    const assignment = survey.assignedUsers.find((u) => u.token === token);
    if (assignment.status === 'responded') {
      throw new ForbiddenException('כבר השבת לסקר זה');
    }

    return { survey, assignment };
  }

  async update(
    id: string,
    dto: Partial<CreateSurveyDto>,
    userId: string,
    role: string,
  ): Promise<SurveyDocument> {
    const survey = await this.findById(id);
    const creatorId = (survey.creator as any)?._id?.toString() ?? survey.creator.toString();
    if (role !== 'admin' && creatorId !== userId) {
      throw new ForbiddenException('אין הרשאה לערוך סקר זה');
    }
    const { creator: _creator, ...rest } = dto as any;
    const payload = { ...rest };
    if (Array.isArray(payload.questions)) {
      payload.questions = payload.questions.filter((q) => q.text?.trim());
    }
    return this.surveyModel.findByIdAndUpdate(id, payload, { new: true });
  }

  async remove(id: string, userId: string, role: string): Promise<void> {
    const survey = await this.findById(id);
    const creatorId = (survey.creator as any)?._id?.toString() ?? survey.creator.toString();
    if (role !== 'admin' && creatorId !== userId) {
      throw new ForbiddenException('אין הרשאה למחוק סקר זה');
    }
    await this.surveyModel.findByIdAndDelete(id);
  }

  async assignToUsers(
    id: string,
    dto: AssignSurveyDto,
    userId: string,
    role: string,
  ) {
    const survey = await this.findById(id);
    const creatorId = (survey.creator as any)?._id?.toString() ?? survey.creator.toString();
    if (role !== 'admin' && creatorId !== userId) {
      throw new ForbiddenException('אין הרשאה לשייך סקר זה');
    }

    const newAssignments = dto.recipients.map((r) => ({
      email: r.email,
      name: r.name,
      userId: r.userId,
      token: randomBytes(32).toString('hex'),
      sentAt: new Date(),
      status: 'sent',
    }));

    survey.assignedUsers.push(...newAssignments);
    if (survey.status === SurveyStatus.DRAFT) {
      survey.status = SurveyStatus.ACTIVE;
    }
    await survey.save();

    // Send emails
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    for (const assignment of newAssignments) {
      const link = `${appUrl}/survey/${assignment.token}`;
      await this.emailService.sendSurveyInvitation(
        assignment.email,
        assignment.name || assignment.email,
        survey.title,
        link,
      );
    }

    return { assigned: newAssignments.length };
  }

  async getStats(userId: string, role: string) {
    const query: any = role === 'admin' ? {} : { creator: new Types.ObjectId(userId) };
    const total = await this.surveyModel.countDocuments(query);
    const byStatus = await this.surveyModel.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const totalResponses = await this.surveyModel.aggregate([
      { $match: query },
      { $unwind: '$assignedUsers' },
      { $match: { 'assignedUsers.status': 'responded' } },
      { $count: 'total' },
    ]);
    return {
      total,
      byStatus,
      totalResponses: totalResponses[0]?.total || 0,
    };
  }
}
