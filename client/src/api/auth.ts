import api from './index';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  role?: string;
  companyName?: string;
  jobTitle?: string;
}

export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  surveyorRegister: (data: any) => api.post('/auth/surveyor/register', data),
  surveyorLogin: (email: string, password: string) =>
    api.post('/auth/surveyor/login', { email, password }),
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};
