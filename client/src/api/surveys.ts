import api from './index';

export const surveysApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    api.get('/surveys', { params }),

  getById: (id: string) => api.get(`/surveys/${id}`),

  getByToken: (token: string) => api.get(`/surveys/by-token/${token}`),

  create: (data: any) => api.post('/surveys', data),

  update: (id: string, data: any) => api.put(`/surveys/${id}`, data),

  remove: (id: string) => api.delete(`/surveys/${id}`),

  assign: (id: string, recipients: Array<{ email: string; name?: string }>) =>
    api.post(`/surveys/${id}/assign`, { recipients }),

  getStats: () => api.get('/surveys/stats'),

  getResponses: (id: string) => api.get(`/responses/survey/${id}`),

  getResponseStats: (id: string) => api.get(`/responses/survey/${id}/stats`),

  submitResponse: (token: string, answers: Array<{ questionId: string; value: any }>) =>
    api.post('/responses', { token, answers }),
};
