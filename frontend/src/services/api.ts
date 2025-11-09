import axios, { AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/login', credentials),
  register: (userData: RegisterData): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/register', userData),
  verifyToken: (token: string): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/verify-token', { token }),
};

// Menu API
export const menuAPI = {
  getAll: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/menu', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/menu/${id}`),
  getCategories: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/menu/categories'),
  create: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/menu', data),
  update: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/menu/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/menu/${id}`),
};

// Cart API
export const cartAPI = {
  get: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/cart'),
  add: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/cart/add', data),
  update: (itemId: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/cart/update/${itemId}`, data),
  remove: (itemId: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/cart/remove/${itemId}`),
  clear: (): Promise<AxiosResponse<ApiResponse>> => 
    api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  create: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/orders', data),
  getAll: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/orders', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/orders/${id}`),
  track: (orderNumber: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/orders/track/${orderNumber}`),
  cancel: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/orders/${id}/cancel`),
  // Admin endpoints
  getAllAdmin: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/orders/admin/all', { params }),
  updateStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/orders/admin/${id}/status`, { status }),
};

// Promotions API
export const promotionsAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/promotions'),
  getById: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/promotions/${id}`),
  validate: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/promotions/validate', data),
  // Admin endpoints
  getAllAdmin: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/promotions/admin/all', { params }),
  create: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/promotions/admin', data),
  update: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/promotions/admin/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/promotions/admin/${id}`),
};

// Users API
export const usersAPI = {
  getProfile: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/users/profile'),
  updateProfile: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put('/users/profile', data),
  changePassword: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put('/users/change-password', data),
  deleteAccount: (): Promise<AxiosResponse<ApiResponse>> => 
    api.delete('/users/account'),
  getDashboardStats: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/users/dashboard-stats'),
};

// Reviews API
export const reviewsAPI = {
  create: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/reviews', data),
  getAll: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/reviews', { params }),
  getTop: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/reviews/top'),
  getUserReviews: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/reviews/user', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/reviews/${id}`),
  update: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/reviews/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/reviews/${id}`),
  markHelpful: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/reviews/${id}/helpful`),
  // Admin endpoints
  getAllAdmin: (params: Record<string, any> = {}): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/reviews/admin/all', { params }),
  approve: (id: string, isApproved: boolean): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/reviews/admin/${id}/approve`, { isApproved }),
  highlight: (id: string, isHighlighted: boolean): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/reviews/admin/${id}/highlight`, { isHighlighted }),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/newsletter/subscribe', data),
  unsubscribe: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/newsletter/unsubscribe', data),
  updatePreferences: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put('/newsletter/preferences', data),
  getSubscriber: (token: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/newsletter/subscriber/${token}`),
};

// Contact API
export const contactAPI = {
  getInfo: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/contact/info'),
  submitForm: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/contact', data),
};

export default api;
