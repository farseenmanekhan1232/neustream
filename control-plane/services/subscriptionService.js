const Database = require('../lib/database');

class SubscriptionService {
  constructor() {
    this.db = new Database();
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId) {
    try {
      const result = await this.db.query(`
        SELECT
          us.*,
          sp.name as plan_name,
          sp.description as plan_description,
          sp.price_monthly,
          sp.price_yearly,
          sp.max_sources,
          sp.max_destinations,
          sp.max_streaming_hours_monthly,
          sp.features
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1 AND us.status = 'active'
        ORDER BY us.created_at DESC
        LIMIT 1
      `, [userId]);

      if (result.length === 0) {
        // Return default free plan
        const freePlan = await this.getPlanByName('Free');
        return {
          ...freePlan,
          status: 'active',
          billing_cycle: 'monthly',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        };
      }

      return result[0];
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription plan by name
   */
  async getPlanByName(name) {
    try {
      const result = await this.db.query(
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
   * Get all available subscription plans
   */
  async getAvailablePlans() {
    try {
      return await this.db.query(
        'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly ASC'
      );
    } catch (error) {
      console.error('Error getting available plans:', error);
      throw error;
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsage(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        subscription: {
          plan_name: subscription.plan_name,
          status: subscription.status,
          billing_cycle: subscription.billing_cycle,
          current_period_end: subscription.current_period_end
        },
        limits: {
          max_sources: subscription.max_sources,
          max_destinations: subscription.max_destinations,
          max_streaming_hours_monthly: subscription.max_streaming_hours_monthly
        },
        current_usage: {
          sources_count: limits.current_sources_count || 0,
          destinations_count: limits.current_destinations_count || 0,
          streaming_hours: limits.current_month_streaming_hours || 0
        },
        features: subscription.features
      };
    } catch (error) {
      console.error('Error getting user usage:', error);
      throw error;
    }
  }

  /**
   * Get user's current limits from plan_limits_tracking
   */
  async getUserLimits(userId) {
    try {
      const result = await this.db.query(
        'SELECT * FROM plan_limits_tracking WHERE user_id = $1',
        [userId]
      );
      return result[0] || { current_sources_count: 0, current_destinations_count: 0, current_month_streaming_hours: 0 };
    } catch (error) {
      console.error('Error getting user limits:', error);
      throw error;
    }
  }

  /**
   * Check if user can create a new source
   */
  async canCreateSource(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        allowed: limits.current_sources_count < subscription.max_sources,
        current: limits.current_sources_count,
        max: subscription.max_sources,
        remaining: subscription.max_sources - limits.current_sources_count
      };
    } catch (error) {
      console.error('Error checking source creation:', error);
      throw error;
    }
  }

  /**
   * Check if user can create a new destination
   */
  async canCreateDestination(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        allowed: limits.current_destinations_count < subscription.max_destinations,
        current: limits.current_destinations_count,
        max: subscription.max_destinations,
        remaining: subscription.max_destinations - limits.current_destinations_count
      };
    } catch (error) {
      console.error('Error checking destination creation:', error);
      throw error;
    }
  }

  /**
   * Check if user can stream (within monthly hour limit)
   */
  async canStream(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const limits = await this.getUserLimits(userId);

      return {
        allowed: limits.current_month_streaming_hours < subscription.max_streaming_hours_monthly,
        current: limits.current_month_streaming_hours,
        max: subscription.max_streaming_hours_monthly,
        remaining: subscription.max_streaming_hours_monthly - limits.current_month_streaming_hours
      };
    } catch (error) {
      console.error('Error checking streaming allowance:', error);
      throw error;
    }
  }

  /**
   * Track stream start
   */
  async trackStreamStart(userId, sourceId) {
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
  async trackStreamEnd(userId, sourceId) {
    try {
      const result = await this.db.query(`
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
  async updateUserSubscription(userId, planId, billingCycle = 'monthly') {
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
  async getStreamingHistory(userId, limit = 50) {
    try {
      return await this.db.query(`
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
  async getMonthlyUsageBreakdown(userId, months = 6) {
    try {
      return await this.db.query(`
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

module.exports = new SubscriptionService();