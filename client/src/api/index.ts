import axios from 'axios';
import { authToken, clearAuth } from '../store/signals';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = authToken.value;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
      
      //window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
