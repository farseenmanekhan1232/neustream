import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API calls
export const adminApi = {
  // Get all users
  getUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  // Get specific user details
  getUserDetails: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Get system statistics
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/api/admin/analytics?period=${period}`);
    return response.data;
  },

  // Get system health
  getHealth: async () => {
    const response = await api.get('/api/admin/health');
    return response.data;
  },

  // Get all active streams
  getActiveStreams: async () => {
    const response = await api.get('/api/streams/active');
    return response.data;
  },

  // Get stream info for a specific stream key
  getStreamInfo: async (streamKey) => {
    const response = await api.get(`/api/streams/forwarding/${streamKey}`);
    return response.data;
  },

  // Validate admin token
  validateToken: async (token) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/validate-token`, {
      token
    });
    return response.data;
  }
};

export default api;