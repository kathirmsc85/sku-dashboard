import axios from 'axios';
import { SKU, Note, AuthResponse, LoginCredentials, RegisterData, User } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

export const skuAPI = {
  getAll: async (params?: {
    search?: string;
    filter_type?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<SKU[]> => {
    const response = await api.get('/skus', { params });
    return response.data;
  },

  getById: async (id: string): Promise<SKU> => {
    const response = await api.get(`/skus/${id}`);
    return response.data;
  },
};

export const notesAPI = {
  getBySKU: async (skuId: string): Promise<Note[]> => {
    const response = await api.get(`/skus/${skuId}/notes`);
    return response.data;
  },

  create: async (data: { sku_id: string; content: string }): Promise<Note> => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  update: async (id: string, content: string): Promise<Note> => {
    const response = await api.put(`/notes/${id}?content=${encodeURIComponent(content)}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

export default api;