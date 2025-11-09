import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('adminToken');
    return Promise.resolve();
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Admin Dashboard API
export const dashboardAPI = {
  getMetrics: () => api.get('/admin/dashboard/metrics'),
  getChartData: (period = '7') => api.get(`/admin/dashboard/charts?period=${period}`),
  getPredictions: () => api.get('/admin/dashboard/predictions'),
  getActivities: (limit = 10) => api.get(`/admin/dashboard/activities?limit=${limit}`),
};

// Menu Management API
export const menuAPI = {
  getMenuItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/menu?${query}`);
  },
  getMenuItem: (id) => api.get(`/admin/menu/${id}`),
  createMenuItem: (data) => api.post('/admin/menu', data),
  updateMenuItem: (id, data) => api.put(`/admin/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/admin/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/admin/menu/${id}/toggle`),
  getMenuStats: () => api.get('/admin/menu/stats'),
};

// User Management API
export const userAPI = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${query}`);
  },
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getUserStats: () => api.get('/admin/users/stats'),
};

// Reports API
export const reportsAPI = {
  getSalesReport: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/sales?${query}`);
  },
  getOrderAnalytics: (period = '30') => api.get(`/admin/reports/orders?period=${period}`),
  getCustomerAnalytics: (period = '30') => api.get(`/admin/reports/customers?period=${period}`),
  exportData: (type, params = {}) => {
    const query = new URLSearchParams({ type, ...params }).toString();
    return api.get(`/admin/reports/export?${query}`);
  },
};

// Promotions API (assuming you have this endpoint)
export const promotionsAPI = {
  getPromotions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/promotions?${query}`);
  },
  getPromotion: (id) => api.get(`/promotions/${id}`),
  createPromotion: (data) => api.post('/promotions', data),
  updatePromotion: (id, data) => api.put(`/promotions/${id}`, data),
  deletePromotion: (id) => api.delete(`/promotions/${id}`),
};

export default api;
