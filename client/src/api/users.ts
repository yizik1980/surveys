import api from './index';

export const usersApi = {
  getAll: (params?: { role?: string; search?: string }) =>
    api.get('/users', { params }),

  getById: (id: string) => api.get(`/users/${id}`),

  create: (data: any) => api.post('/users', data),

  update: (id: string, data: any) => api.put(`/users/${id}`, data),

  remove: (id: string) => api.delete(`/users/${id}`),

  getStats: () => api.get('/users/stats'),
};
