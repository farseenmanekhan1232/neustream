import { apiService } from './api';

class SubscriptionService {
  // Get all available subscription plans
  async getPlans() {
    return await apiService.get('/subscriptions/plans');
  }

  // Get user's current subscription
  async getMySubscription() {
    return await apiService.get('/subscriptions/my-subscription');
  }

  // Create a new subscription
  async createSubscription(planId, billingCycle = 'monthly') {
    return await apiService.post('/subscriptions/subscribe', {
      planId,
      billingCycle
    });
  }

  // Cancel subscription
  async cancelSubscription() {
    return await apiService.post('/subscriptions/cancel');
  }

  // Get usage metrics
  async getUsage() {
    return await apiService.get('/subscriptions/usage');
  }

  // Check plan limits
  async getLimits() {
    return await apiService.get('/subscriptions/limits');
  }

  // Get payment history
  async getPaymentHistory() {
    return await apiService.get('/subscriptions/payments');
  }
}

export const subscriptionService = new SubscriptionService();