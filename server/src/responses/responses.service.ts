import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SurveyResponse, ResponseDocument } from './response.schema';
import { Survey, SurveyDocument, SurveyStatus } from '../surveys/survey.schema';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectModel(SurveyResponse.name)
    private responseModel: Model<ResponseDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  async submit(dto: SubmitResponseDto) {
    const survey = await this.surveyModel.findOne({
      'assignedUsers.token': dto.token,
      status: SurveyStatus.ACTIVE,
    });

    if (!survey) throw new NotFoundException('קישור הסקר אינו תקף');

    const assignment = survey.assignedUsers.find((u) => u.token === dto.token);
    if (!assignment) throw new NotFoundException('שיוך סקר לא נמצא');
    if (assignment.status === 'responded') {
      throw new ForbiddenException('כבר השבת לסקר זה');
    }

    const response = new this.responseModel({
      survey: survey._id,
      respondentEmail: assignment.email,
      respondentName: assignment.name,
      token: dto.token,
      answers: dto.answers,
    });
    await response.save();

    // Mark assignment as responded
    assignment.status = 'responded';
    assignment.respondedAt = new Date();
    await survey.save();

    return { message: 'תשובות נשמרו בהצלחה', id: response._id };
  }

  async findBySurvey(surveyId: string) {
    return this.responseModel
      .find({ survey: new Types.ObjectId(surveyId) })
      .sort({ submittedAt: -1 })
      .lean();
  }

  async getSurveyStats(surveyId: string) {
    const responses = await this.findBySurvey(surveyId);
    const survey = await this.surveyModel.findById(surveyId);

    const stats = {
      total: responses.length,
      assigned: survey?.assignedUsers?.length || 0,
      responseRate:
        survey?.assignedUsers?.length
          ? Math.round((responses.length / survey.assignedUsers.length) * 100)
          : 0,
      byQuestion: {} as Record<string, any>,
    };

    if (survey) {
      for (const question of survey.questions) {
        const answers = responses.map((r) =>
          r.answers.find((a) => a.questionId === question.id),
        ).filter(Boolean);

        if (question.type === 'radio' || question.type === 'select') {
          const counts: Record<string, number> = {};
          answers.forEach((a) => {
            counts[a.value] = (counts[a.value] || 0) + 1;
          });
          stats.byQuestion[question.id] = { type: question.type, counts };
        } else if (question.type === 'rating') {
          const nums = answers.map((a) => Number(a.value)).filter((n) => !isNaN(n));
          stats.byQuestion[question.id] = {
            type: 'rating',
            average: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0,
            count: nums.length,
          };
        } else {
          stats.byQuestion[question.id] = {
            type: question.type,
            answers: answers.map((a) => a.value),
          };
        }
      }
    }

    return stats;
  }
}
