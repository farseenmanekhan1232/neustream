import Database from '../lib/database';
import {
  UserSubscription,
  SubscriptionPlan,
  UserUsage,
  CanCreateSourceResult,
  CanCreateDestinationResult,
  CanStreamResult,
  CanCreateChatConnectorResult,
  MonthlyUsageBreakdown,
  PlanLimitsTracking,
  UsageTracking
} from '../types/entities';

/**
 * Subscription Service
 * Handles user subscriptions, plan limits, and usage tracking
 */
class SubscriptionService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Get user's current subscription with currency support
   */
  async getUserSubscription(userId: number, currency: string = 'USD'): Promise<UserSubscription> {
    try {
      const result = await this.db.query<UserSubscription>(`
        SELECT
          us.*,
          sp.name as plan_name,
          sp.description as plan_description,
          sp.price_monthly,
          sp.price_yearly,
          sp.price_monthly_inr,
          sp.price_yearly_inr,
          sp.max_sources,
          sp.max_destinations,
          sp.max_streaming_hours_monthly,
          sp.features
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1 AND us.status = 'active'
        AND us.current_period_end > NOW()
        ORDER BY us.created_at DESC
        LIMIT 1
      `, [userId]);

      if (result.length === 0) {
        // Return default free plan with limited features
        return await this.getFreePlanWithLimitedFeatures(userId, currency);
      }

      const subscription = result[0];
      // Note: currencyService will need to be converted to access this
      // const processedPlan = await currencyService.processPlanWithCurrency(subscription, currency);

      return {
        ...subscription,
        // ...processedPlan
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * Get free plan with limited features for expired subscriptions
   */
  async getFreePlanWithLimitedFeatures(userId: number, currency: string = 'USD'): Promise<UserSubscription> {
    try {
      const freePlan = await this.getPlanByName('Free');
      if (!freePlan) {
        throw new Error('Free plan not found in database');
      }

      // Note: currencyService will need to be converted to access this
      // const processedPlan = await currencyService.processPlanWithCurrency(freePlan, currency);

      return {
        user_id: userId,
        plan_id: freePlan.id,
        status: 'active',
        billing_cycle: 'monthly',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        is_expired_subscription: true,
        plan_name: freePlan.name,
        plan_description: freePlan.description,
        price_monthly: freePlan.price_monthly,
        price_yearly: freePlan.price_yearly,
        price_monthly_inr: freePlan.price_monthly_inr,
        price_yearly_inr: freePlan.price_yearly_inr,
        max_sources: freePlan.max_sources,
        max_destinations: freePlan.max_destinations,
        max_streaming_hours_monthly: freePlan.max_streaming_hours_monthly,
        features: freePlan.features
      } as UserSubscription;
    } catch (error) {
      console.error('Error getting free plan with limited features:', error);
      throw error;
    }
  }

  /**
   * Get subscription plan by name
   */
  async getPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    try {
      const result = await this.db.query<SubscriptionPlan>(
        'SELECT * FROM subscription_plans WHERE name = $1 AND is_active = true',
        [name]
      );
      return result[0];
    } catch (error) {
      console.error('Error getting plan by name:', error);
      throw error;
    }
  }

  /**
   * Get all available subscription plans with currency support
   */
  async getAvailablePlans(currency: string = 'USD'): Promise<SubscriptionPlan[]> {
    try {
      const plans = await this.db.query<SubscriptionPlan>(
        'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly ASC'
      );

      // Process each plan with currency conversion
      // Note: currencyService will need to be converted to access this
      const processedPlans = await Promise.all(
        plans.map(async (plan) => {
          // return await currencyService.processPlanWithCurrency(plan, currency);
          return plan;
        })
      );

      return processedPlans;
    } catch (error) {
      console.error('Error getting available plans:', error);
      throw error;
    }
  }

  /**
   * Parse feature value from features array
   * Features are stored as array of strings like: ["Chat Connectors: 2", "Support: community"]
   */
  parseFeatureValue(features: string[] | undefined | null, featureName: string): number | null {
    if (!Array.isArray(features)) return null;

    // Case-insensitive search for feature name (e.g., "chat_connectors" matches "Chat Connectors")
    const feature = features.find(f => {
      const normalized = f.toLowerCase().replace(/\s+/g, ' ').trim();
      const searchName = featureName.toLowerCase().replace(/_/g, ' ').trim();
      return normalized.startsWith(searchName + ':');
    });
    if (!feature) return null;

    const match = feature.match(/:\s*(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsage(userId: number): Promise<UserUsage> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        subscription: {
          plan_name: subscription.plan_name || '',
          status: subscription.status || 'active',
          billing_cycle: subscription.billing_cycle || 'monthly',
          current_period_end: subscription.current_period_end || new Date()
        },
        limits: {
          max_sources: subscription.max_sources || 0,
          max_destinations: subscription.max_destinations || 0,
          max_streaming_hours_monthly: subscription.max_streaming_hours_monthly || 0,
          max_chat_connectors: this.parseFeatureValue(subscription.features, 'chat_connectors') || 1
        },
        current_usage: {
          sources_count: limits.current_sources_count || 0,
          destinations_count: limits.current_destinations_count || 0,
          streaming_hours: limits.current_month_streaming_hours || 0,
          chat_connectors_count: limits.current_chat_connectors_count || 0
        },
        features: subscription.features || []
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      throw error;
    }
  }

  /**
   * Get user's current limits from plan_limits_tracking
   */
  async getUserLimits(userId: number): Promise<PlanLimitsTracking> {
    try {
      const result = await this.db.query<PlanLimitsTracking>(
        'SELECT * FROM plan_limits_tracking WHERE user_id = $1',
        [userId]
      );
      return result[0] || {
        user_id: userId,
        current_sources_count: 0,
        current_destinations_count: 0,
        current_month_streaming_hours: 0,
        current_chat_connectors_count: 0
      };
    } catch (error) {
      console.error('Error getting user limits:', error);
      throw error;
    }
  }

  /**
   * Check if user can create a new source
   */
  async canCreateSource(userId: number): Promise<CanCreateSourceResult> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        allowed: (limits.current_sources_count || 0) < (subscription.max_sources || 0),
        current: limits.current_sources_count || 0,
        max: subscription.max_sources || 0,
        remaining: (subscription.max_sources || 0) - (limits.current_sources_count || 0)
      };
    } catch (error) {
      console.error('Error checking source creation:', error);
      throw error;
    }
  }

  /**
   * Check if user can create a new destination
   */
  async canCreateDestination(userId: number): Promise<CanCreateDestinationResult> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        allowed: (limits.current_destinations_count || 0) < (subscription.max_destinations || 0),
        current: limits.current_destinations_count || 0,
        max: subscription.max_destinations || 0,
        remaining: (subscription.max_destinations || 0) - (limits.current_destinations_count || 0)
      };
    } catch (error) {
      console.error('Error checking destination creation:', error);
      throw error;
    }
  }

  /**
   * Check if user can stream (within monthly hour limit)
   */
  async canStream(userId: number): Promise<CanStreamResult> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        allowed: (limits.current_month_streaming_hours || 0) < (subscription.max_streaming_hours_monthly || 0),
        current: limits.current_month_streaming_hours || 0,
        max: subscription.max_streaming_hours_monthly || 0,
        remaining: (subscription.max_streaming_hours_monthly || 0) - (limits.current_month_streaming_hours || 0)
      };
    } catch (error) {
      console.error('Error checking streaming allowance:', error);
      throw error;
    }
  }

  /**
   * Check if user can create a new chat connector
   */
  async canCreateChatConnector(userId: number): Promise<CanCreateChatConnectorResult> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);
      const maxChatConnectors = this.parseFeatureValue(subscription.features, 'chat_connectors') || 1;

      return {
        allowed: (limits.current_chat_connectors_count || 0) < maxChatConnectors,
        current: limits.current_chat_connectors_count || 0,
        max: maxChatConnectors,
        remaining: maxChatConnectors - (limits.current_chat_connectors_count || 0)
      };
    } catch (error) {
      console.error('Error checking chat connector creation:', error);
      throw error;
    }
  }

  /**
   * Check if user has an active paid subscription
   */
  async hasActivePaidSubscription(userId: number): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      return !subscription.is_expired_subscription && subscription.plan_name !== 'Free';
    } catch (error) {
      console.error('Error checking active paid subscription:', error);
      return false;
    }
  }

  /**
   * Get users with expired subscriptions
   */
  async getUsersWithExpiredSubscriptions(): Promise<number[]> {
    try {
      const result = await this.db.query<{ user_id: number }>(`
        SELECT DISTINCT us.user_id
        FROM user_subscriptions us
        WHERE us.status = 'active'
        AND us.current_period_end < NOW()
      `);
      return result.map(row => row.user_id);
    } catch (error) {
      console.error('Error getting users with expired subscriptions:', error);
      return [];
    }
  }

  /**
   * Track stream start
   */
  async trackStreamStart(userId: number, sourceId: number): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      await this.db.query(`
        INSERT INTO usage_tracking (user_id, source_id, stream_start, month_year)
        VALUES ($1, $2, $3, $4)
      `, [userId, sourceId, new Date(), currentMonth]);

      console.log(`📊 Stream start tracked for user ${userId}, source ${sourceId}`);
    } catch (error) {
      console.error('Error tracking stream start:', error);
      throw error;
    }
  }

  /**
   * Track stream end
   */
  async trackStreamEnd(userId: number, sourceId: number): Promise<void> {
    try {
      const result = await this.db.query<{ id: number; duration_minutes: number }>(`
        UPDATE usage_tracking
        SET stream_end = $1, duration_minutes = EXTRACT(EPOCH FROM ($1 - stream_start))/60
        WHERE user_id = $2 AND source_id = $3 AND stream_end IS NULL
        RETURNING id, duration_minutes
      `, [new Date(), userId, sourceId]);

      if (result.length > 0) {
        console.log(`📊 Stream end tracked for user ${userId}, source ${sourceId}, duration: ${result[0].duration_minutes} minutes`);
      }
    } catch (error) {
      console.error('Error tracking stream end:', error);
      throw error;
    }
  }

  /**
   * Update user's subscription
   */
  async updateUserSubscription(userId: number, planId: number, billingCycle: string = 'monthly'): Promise<void> {
    try {
      // Cancel current active subscription
      await this.db.query(`
        UPDATE user_subscriptions
        SET status = 'canceled', updated_at = NOW()
        WHERE user_id = $1 AND status = 'active'
      `, [userId]);

      // Create new subscription
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

      await this.db.query(`
        INSERT INTO user_subscriptions (
          user_id, plan_id, status, billing_cycle,
          current_period_start, current_period_end
        ) VALUES ($1, $2, 'active', $3, $4, $5)
      `, [userId, planId, billingCycle, currentPeriodStart, currentPeriodEnd]);

      console.log(`🔄 User ${userId} subscription updated to plan ${planId}`);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's streaming history
   */
  async getStreamingHistory(userId: number, limit: number = 50): Promise<UsageTracking[]> {
    try {
      return await this.db.query<UsageTracking>(`
        SELECT
          ut.*,
          ss.name as source_name
        FROM usage_tracking ut
        JOIN stream_sources ss ON ut.source_id = ss.id
        WHERE ut.user_id = $1
        ORDER BY ut.stream_start DESC
        LIMIT $2
      `, [userId, limit]);
    } catch (error) {
      console.error('Error getting streaming history:', error);
      throw error;
    }
  }

  /**
   * Get monthly usage breakdown
   */
  async getMonthlyUsageBreakdown(userId: number, months: number = 6): Promise<MonthlyUsageBreakdown[]> {
    try {
      return await this.db.query<MonthlyUsageBreakdown>(`
        SELECT
          month_year,
          COUNT(*) as stream_count,
          SUM(duration_minutes)/60 as total_hours
        FROM usage_tracking
        WHERE user_id = $1
        AND month_year >= TO_CHAR(NOW() - INTERVAL '${months} months', 'YYYY-MM')
        GROUP BY month_year
        ORDER BY month_year DESC
      `, [userId]);
    } catch (error) {
      console.error('Error getting monthly usage breakdown:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new SubscriptionService();
