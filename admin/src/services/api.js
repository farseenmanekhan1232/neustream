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
  console.log('🚀 Making API request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    hasToken: !!token
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Added auth token to request');
  } else {
    console.log('⚠️ No auth token found in localStorage');
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', {
      status: response.status,
      url: response.config.url,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API error received:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('🚪 Redirecting to login due to 401 error');
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
    const response = await api.get('/api/admin/analytics/stats');
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/api/admin/analytics?period=${period}`);
    return response.data;
  },

  // Get system health
  getHealth: async () => {
    const response = await api.get('/api/admin/system/health');
    return response.data;
  },

  // Validate admin token
  validateToken: async (token) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/validate-token`, {
      token
    });
    return response.data;
  },

  // ============================================
  // STREAM SOURCES MANAGEMENT
  // ============================================

  // Get all stream sources
  getSources: async () => {
    const response = await api.get('/api/admin/sources');
    return response.data;
  },

  // Get specific stream source
  getSource: async (sourceId) => {
    const response = await api.get(`/api/admin/sources/${sourceId}`);
    return response.data;
  },

  // Update stream source
  updateSource: async (sourceId, sourceData) => {
    const response = await api.put(`/api/admin/sources/${sourceId}`, sourceData);
    return response.data;
  },


  // Delete stream source
  deleteSource: async (sourceId) => {
    const response = await api.delete(`/api/admin/sources/${sourceId}`);
    return response.data;
  },

  // ============================================
  // DESTINATIONS MANAGEMENT
  // ============================================

  // Get all destinations
  getDestinations: async () => {
    const response = await api.get('/api/admin/destinations');
    return response.data;
  },

  // Get specific destination
  getDestination: async (destinationId) => {
    const response = await api.get(`/api/admin/destinations/${destinationId}`);
    return response.data;
  },

  // Update destination
  updateDestination: async (destinationId, destinationData) => {
    const response = await api.put(`/api/admin/destinations/${destinationId}`, destinationData);
    return response.data;
  },

  // Delete destination
  deleteDestination: async (destinationId) => {
    const response = await api.delete(`/api/admin/destinations/${destinationId}`);
    return response.data;
  },

  // ============================================
  // USER MANAGEMENT EXTENSIONS
  // ============================================

  // Suspend user
  suspendUser: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/suspend`);
    return response.data;
  },

  // Unsuspend user
  unsuspendUser: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/unsuspend`);
    return response.data;
  },

  // Reset user stream key
  resetUserStreamKey: async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/reset-stream-key`);
    return response.data;
  },

  // ============================================
  // ANALYTICS AND REPORTS
  // ============================================

  // Get detailed user analytics
  getUserAnalytics: async (period = '30d') => {
    const response = await api.get(`/api/admin/analytics/users?period=${period}`);
    return response.data;
  },

  // Get detailed stream analytics
  getStreamAnalytics: async (period = '30d') => {
    const response = await api.get(`/api/admin/analytics/streams?period=${period}`);
    return response.data;
  },

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  // Get subscription analytics
  getSubscriptionAnalytics: async () => {
    const response = await api.get('/api/admin/subscriptions/subscription-analytics');
    return response.data;
  },

  // Get subscription plans with currency support
  getSubscriptionPlans: async () => {
    const response = await api.get('/api/admin/subscriptions/plans');
    return response.data;
  },

  // Create subscription plan
  createSubscriptionPlan: async (planData) => {
    const response = await api.post('/api/admin/subscriptions/plans', planData);
    return response.data;
  },

  // Update subscription plan
  updateSubscriptionPlan: async (planId, planData) => {
    const response = await api.put(`/api/admin/subscriptions/plans/${planId}`, planData);
    return response.data;
  },

  // Delete subscription plan
  deleteSubscriptionPlan: async (planId) => {
    const response = await api.delete(`/api/admin/subscriptions/plans/${planId}`);
    return response.data;
  },

  // Get user subscriptions
  getUserSubscriptions: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/subscriptions/user-subscriptions?${queryParams}`);
    return response.data;
  },

  // Update user subscription
  updateUserSubscription: async (userId, subscriptionData) => {
    const response = await api.put(`/api/admin/subscriptions/user-subscriptions/${userId}`, subscriptionData);
    return response.data;
  },

  // Promote/Demote user subscription
  promoteDemoteUserSubscription: async (userId, data) => {
    const response = await api.put(`/api/admin/subscriptions/user-subscriptions/${userId}/promote-demote`, data);
    return response.data;
  },

  // Get all limit overrides
  getLimitOverrides: async () => {
    const response = await api.get('/api/admin/subscriptions/limit-overrides');
    return response.data;
  },

  // Get user limit overrides
  getUserLimitOverrides: async (userId) => {
    const response = await api.get(`/api/admin/subscriptions/users/${userId}/limits/overrides`);
    return response.data;
  },

  // Set limit override for user
  setUserLimitOverride: async (userId, overrideData) => {
    const response = await api.post(`/api/admin/subscriptions/users/${userId}/limits/override`, overrideData);
    return response.data;
  },

  // Remove limit override for user
  removeUserLimitOverride: async (userId, limitType) => {
    const response = await api.delete(`/api/admin/subscriptions/users/${userId}/limits/override/${limitType}`);
    return response.data;
  },

  // Get active streams with details
  getActiveStreams: async () => {
    const response = await api.get('/api/admin/streams/active');
    return response.data;
  },

  // Get stream preview information
  getStreamPreview: async (streamKey) => {
    const response = await api.get(`/api/admin/streams/${streamKey}/preview`);
    return response.data;
  },

  // Stop a stream
  stopStream: async (streamKey, reason) => {
    const response = await api.post(`/api/admin/streams/${streamKey}/stop`, { reason });
    return response.data;
  },

  // Get stream control logs
  getStreamControlLogs: async (limit = 50) => {
    const response = await api.get(`/api/admin/streams/control-logs?limit=${limit}`);
    return response.data;
  },

  // ============================================
  // CONTACT SUBMISSION MANAGEMENT
  // ============================================

  // Get all contact submissions
  getContactSubmissions: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/contact?${queryParams}`);
    return response.data;
  },

  // Get contact submission by ID
  getContactSubmission: async (submissionId) => {
    const response = await api.get(`/api/contact/${submissionId}`);
    return response.data;
  },

  // Update contact submission
  updateContactSubmission: async (submissionId, updateData) => {
    const response = await api.patch(`/api/contact/${submissionId}`, updateData);
    return response.data;
  },

  // Add response to contact submission
  addContactResponse: async (submissionId, responseData) => {
    const response = await api.post(`/api/contact/${submissionId}/responses`, responseData);
    return response.data;
  }
};

export default api;