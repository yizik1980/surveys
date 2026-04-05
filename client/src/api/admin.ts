import api from './index';

export interface SubscriptionData {
  plan: 'monthly' | 'annual';
  status?: 'trial' | 'active' | 'inactive' | 'cancelled';
  pricePerMonth?: number;
  startDate?: string;
  endDate?: string;
}

export interface SurveyorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
  subscription?: SubscriptionData;
}

export const adminApi = {
  getSurveyors: (search?: string) =>
    api.get('/admin/surveyors', { params: search ? { search } : {} }),
  getSurveyorStats: () => api.get('/admin/surveyors/stats'),
  createSurveyor: (data: SurveyorData) => api.post('/admin/surveyors', data),
  updateSurveyor: (id: string, data: Partial<SurveyorData>) =>
    api.put(`/admin/surveyors/${id}`, data),
  deleteSurveyor: (id: string) => api.delete(`/admin/surveyors/${id}`),
};
