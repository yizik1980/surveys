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

  getStats: async () => {
    const CACHE_KEY = 'surveys_stats_cache';
    const TTL_MS = 5 * 60 * 1000; // 5 minutes
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < TTL_MS) {
        return { data };
      }
    }
    const res = await api.get('/surveys/stats');
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: res.data, ts: Date.now() }));
    return res;
  },

  getResponses: (id: string) => api.get(`/responses/survey/${id}`),

  getResponseStats: (id: string) => api.get(`/responses/survey/${id}/stats`),

  getMyAssignments: () => api.get('/surveys/my-assignments'),

  submitResponse: (token: string, answers: Array<{ questionId: string; value: any }>) =>
    api.post('/responses', { token, answers }),
};
