import { apiService } from './api';

export const subscriptionService = {
  /**
   * Get user's current subscription and usage
   */
  async getMySubscription() {
    try {
      const response = await apiService.get('/subscriptions/usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      // Return default free plan data if API fails
      return {
        subscription: {
          plan_name: 'Free',
          status: 'active',
          billing_cycle: 'monthly',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        limits: {
          max_sources: 1,
          max_destinations: 3,
          max_streaming_hours_monthly: 50
        },
        current_usage: {
          sources_count: 0,
          destinations_count: 0,
          streaming_hours: 0
        },
        features: {
          analytics: 'basic',
          support: 'community'
        }
      };
    }
  },

  /**
   * Get available subscription plans
   */
  async getPlans() {
    try {
      const response = await apiService.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  /**
   * Get user's streaming history
   */
  async getStreamingHistory(limit = 50) {
    try {
      const response = await apiService.get(`/subscriptions/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming history:', error);
      return [];
    }
  },

  /**
   * Get monthly usage breakdown
   */
  async getMonthlyUsageBreakdown(months = 6) {
    try {
      const response = await apiService.get(`/subscriptions/usage/breakdown?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly usage breakdown:', error);
      return [];
    }
  },

  /**
   * Check if user can create a source
   */
  async canCreateSource() {
    try {
      const response = await apiService.get('/subscriptions/limits/sources');
      return response.data;
    } catch (error) {
      console.error('Error checking source limits:', error);
      return { allowed: true, current: 0, max: 1, remaining: 1 };
    }
  },

  /**
   * Check if user can create a destination
   */
  async canCreateDestination() {
    try {
      const response = await apiService.get('/subscriptions/limits/destinations');
      return response.data;
    } catch (error) {
      console.error('Error checking destination limits:', error);
      return { allowed: true, current: 0, max: 3, remaining: 3 };
    }
  },

  /**
   * Check if user can stream
   */
  async canStream() {
    try {
      const response = await apiService.get('/subscriptions/limits/streaming');
      return response.data;
    } catch (error) {
      console.error('Error checking streaming limits:', error);
      return { allowed: true, current: 0, max: 50, remaining: 50 };
    }
  },

  /**
   * Update user's subscription (for testing/admin purposes)
   */
  async updateSubscription(planId, billingCycle = 'monthly') {
    try {
      const response = await apiService.post('/subscriptions/update', {
        plan_id: planId,
        billing_cycle: billingCycle
      });
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};