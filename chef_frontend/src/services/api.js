import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chefToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chefToken');
      localStorage.removeItem('chefUser');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

const chefApi = {
  // Auth APIs
  auth: {
    login: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    
    refreshToken: async () => {
      const response = await api.post('/auth/refresh');
      return response.data;
    },
  },

  // Order APIs
  orders: {
    getPendingOrders: async (params = {}) => {
      const response = await api.get('/chef/orders/pending', { params });
      return response.data;
    },

    getAssignedOrders: async (params = {}) => {
      const response = await api.get('/chef/orders/assigned', { params });
      return response.data;
    },

    acceptOrder: async (orderId, data = {}) => {
      const response = await api.post(`/chef/orders/accept/${orderId}`, data);
      return response.data;
    },

    updateOrderStatus: async (orderId, data) => {
      const response = await api.put(`/chef/orders/update/${orderId}`, data);
      return response.data;
    },
  },

  // Kitchen APIs
  kitchen: {
    getKitchenTasks: async (params = {}) => {
      const response = await api.get('/chef/kitchen', { params });
      return response.data;
    },

    getKitchenTask: async (taskId) => {
      const response = await api.get(`/chef/kitchen/${taskId}`);
      return response.data;
    },

    updateKitchenTask: async (taskId, data) => {
      const response = await api.put(`/chef/kitchen/${taskId}`, data);
      return response.data;
    },

    updateTaskStatus: async (taskId, data) => {
      const response = await api.put(`/chef/kitchen/${taskId}`, data);
      return response.data;
    },

    deleteKitchenTask: async (taskId) => {
      const response = await api.delete(`/chef/kitchen/${taskId}`);
      return response.data;
    },

    getKitchenStats: async (params = {}) => {
      const response = await api.get('/chef/kitchen/stats', { params });
      return response.data;
    },

    assignTaskToChef: async (data) => {
      const response = await api.post('/chef/kitchen/assign', data);
      return response.data;
    },
  },

  // Reports APIs
  reports: {
    getKitchenReport: async (params = {}) => {
      const response = await api.get('/chef/reports/kitchen', { params });
      return response.data;
    },

    getOrderAnalytics: async (params = {}) => {
      const response = await api.get('/chef/reports/orders', { params });
      return response.data;
    },

    exportReport: async (params = {}) => {
      const response = await api.get('/chef/reports/export', { params });
      return response.data;
    },

    exportPerformanceData: async (params = {}) => {
      const response = await api.get('/chef/reports/export', { params });
      return response.data;
    },

    getChefPerformance: async (chefId, params = {}) => {
      const response = await api.get(`/chef/reports/chef/${chefId}`, { params });
      return response.data;
    },
  },

  // Dashboard API
  dashboard: {
    getDashboardData: async () => {
      const response = await api.get('/chef/dashboard');
      return response.data;
    },
  },

  // Chef Management APIs (renaming users to chef for consistency)
  chef: {
    getAllChefs: async (params = {}) => {
      const response = await api.get('/chef/users', { params });
      return response.data;
    },

    getChef: async (userId) => {
      const response = await api.get(`/chef/users/${userId}`);
      return response.data;
    },

    createChef: async (data) => {
      const response = await api.post('/chef/users', data);
      return response.data;
    },

    updateChef: async (userId, data) => {
      const response = await api.put(`/chef/users/${userId}`, data);
      return response.data;
    },

    deleteChef: async (userId) => {
      const response = await api.delete(`/chef/users/${userId}`);
      return response.data;
    },

    getChefStats: async (chefId = null) => {
      const endpoint = chefId ? `/chef/users/${chefId}/stats` : '/chef/users/stats';
      const response = await api.get(endpoint);
      return response.data;
    },

    toggleChefStatus: async (chefId) => {
      const response = await api.patch(`/chef/users/${chefId}/toggle`);
      return response.data;
    },
  },
};

export default chefApi;
