const Razorpay = require('razorpay');
const Database = require('../lib/database');
const posthogService = require('./posthog');

class SubscriptionService {
  constructor() {
    this.db = new Database();
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  /**
   * Get all available subscription plans
   */
  async getPlans() {
    try {
      const plans = await this.db.query(
        'SELECT * FROM subscription_plans WHERE is_active = true AND is_public = true ORDER BY sort_order'
      );
      return plans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId) {
    try {
      const subscriptions = await this.db.query(
        `SELECT
          us.*,
          sp.name as plan_name,
          sp.description as plan_description,
          sp.max_stream_sources,
          sp.max_simultaneous_destinations,
          sp.max_streaming_hours_monthly,
          sp.has_advanced_analytics,
          sp.has_priority_support,
          sp.has_custom_rtmp,
          sp.has_stream_preview,
          sp.has_team_access,
          sp.has_custom_branding,
          sp.has_api_access
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1 AND us.status = 'active'
        ORDER BY us.current_period_end DESC
        LIMIT 1`,
        [userId]
      );

      return subscriptions.length > 0 ? subscriptions[0] : null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's usage for current billing period
   */
  async getUserUsage(userId) {
    try {
      const currentPeriod = await this.getCurrentBillingPeriod();

      const usage = await this.db.query(
        `SELECT * FROM usage_tracking
         WHERE user_id = $1 AND period_start = $2 AND period_end = $3`,
        [userId, currentPeriod.start, currentPeriod.end]
      );

      return usage.length > 0 ? usage[0] : {
        user_id: userId,
        streaming_hours_used: 0,
        active_stream_sources: 0,
        total_destinations: 0,
        period_start: currentPeriod.start,
        period_end: currentPeriod.end
      };
    } catch (error) {
      console.error('Error fetching user usage:', error);
      throw error;
    }
  }

  /**
   * Create a Razorpay subscription for a user
   */
  async createSubscription(userId, planId, billingCycle = 'monthly') {
    try {
      // Get plan details
      const plans = await this.db.query(
        'SELECT * FROM subscription_plans WHERE id = $1',
        [planId]
      );

      if (plans.length === 0) {
        throw new Error('Plan not found');
      }

      const plan = plans[0];
      const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

      // Create Razorpay subscription
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: billingCycle === 'yearly' ? plan.stripe_yearly_price_id : plan.stripe_price_id,
        customer_notify: 1,
        total_count: billingCycle === 'yearly' ? 1 : 12, // 1 year or 12 months
        quantity: 1,
        notes: {
          user_id: userId,
          plan_name: plan.name
        }
      });

      // Calculate billing period
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      if (billingCycle === 'yearly') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      // Create subscription record in database
      const userSubscription = await this.db.run(
        `INSERT INTO user_subscriptions
         (user_id, plan_id, status, billing_cycle, razorpay_subscription_id,
          current_period_start, current_period_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          planId,
          'pending', // Will be updated when payment succeeds
          billingCycle,
          subscription.id,
          currentPeriodStart,
          currentPeriodEnd
        ]
      );

      // Track subscription creation
      posthogService.trackSubscriptionEvent(userId, 'subscription_created', {
        plan_id: planId,
        plan_name: plan.name,
        billing_cycle: billingCycle,
        amount: amount,
        razorpay_subscription_id: subscription.id
      });

      return {
        subscription: userSubscription,
        razorpay_subscription: subscription,
        checkout_url: subscription.short_url
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Cancel in Razorpay
      await this.razorpay.subscriptions.cancel(subscription.razorpay_subscription_id);

      // Update database
      const updatedSubscription = await this.db.run(
        `UPDATE user_subscriptions
         SET status = 'canceled', canceled_at = NOW(), cancel_at_period_end = true
         WHERE user_id = $1 AND status = 'active'
         RETURNING *`,
        [userId]
      );

      // Track cancellation
      posthogService.trackSubscriptionEvent(userId, 'subscription_canceled', {
        subscription_id: subscription.id,
        razorpay_subscription_id: subscription.razorpay_subscription_id
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook events
   */
  async handleWebhook(event) {
    try {
      const { event: eventType, payload } = event;

      // Store event for processing
      await this.db.run(
        'INSERT INTO subscription_events (event_type, razorpay_event_id, payload) VALUES ($1, $2, $3)',
        [eventType, payload.subscription?.id || payload.payment?.id, payload]
      );

      // Process specific events
      switch (eventType) {
        case 'subscription.charged':
          await this.handleSubscriptionCharged(payload);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Handle subscription charged event
   */
  async handleSubscriptionCharged(payload) {
    const { subscription, payment } = payload;

    // Update subscription status
    await this.db.run(
      `UPDATE user_subscriptions
       SET status = 'active', current_period_start = $1, current_period_end = $2
       WHERE razorpay_subscription_id = $3`,
      [
        new Date(subscription.current_start * 1000),
        new Date(subscription.current_end * 1000),
        subscription.id
      ]
    );

    // Record payment transaction
    await this.db.run(
      `INSERT INTO payment_transactions
       (user_id, subscription_id, amount, currency, status,
        razorpay_payment_id, razorpay_order_id, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        subscription.notes?.user_id,
        null, // Will be linked after we get subscription ID
        payment.amount,
        payment.currency,
        'succeeded',
        payment.id,
        payment.order_id,
        new Date(payment.created_at * 1000)
      ]
    );

    // Track successful payment
    posthogService.trackSubscriptionEvent(
      subscription.notes?.user_id,
      'payment_succeeded',
      {
        amount: payment.amount,
        currency: payment.currency,
        razorpay_payment_id: payment.id
      }
    );
  }

  /**
   * Handle subscription cancelled event
   */
  async handleSubscriptionCancelled(payload) {
    const { subscription } = payload;

    await this.db.run(
      `UPDATE user_subscriptions
       SET status = 'canceled', canceled_at = NOW()
       WHERE razorpay_subscription_id = $1`,
      [subscription.id]
    );

    posthogService.trackSubscriptionEvent(
      subscription.notes?.user_id,
      'subscription_canceled_webhook',
      { razorpay_subscription_id: subscription.id }
    );
  }

  /**
   * Handle payment failed event
   */
  async handlePaymentFailed(payload) {
    const { payment } = payload;

    await this.db.run(
      `UPDATE user_subscriptions
       SET status = 'past_due'
       WHERE razorpay_subscription_id = $1`,
      [payment.subscription_id]
    );

    // Record failed payment
    await this.db.run(
      `INSERT INTO payment_transactions
       (user_id, subscription_id, amount, currency, status,
        razorpay_payment_id, razorpay_order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        null, // User ID not available in failed payment webhook
        null,
        payment.amount,
        payment.currency,
        'failed',
        payment.id,
        payment.order_id
      ]
    );

    posthogService.trackSubscriptionEvent(
      'anonymous',
      'payment_failed',
      {
        amount: payment.amount,
        currency: payment.currency,
        razorpay_payment_id: payment.id,
        error_description: payment.error_description
      }
    );
  }

  /**
   * Check if user can create more stream sources based on their plan
   */
  async canCreateStreamSource(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUserUsage(userId);

      if (!subscription) {
        // Free plan limits
        return usage.active_stream_sources < 1;
      }

      return usage.active_stream_sources < subscription.max_stream_sources;
    } catch (error) {
      console.error('Error checking stream source limit:', error);
      return false;
    }
  }

  /**
   * Check if user can add more destinations based on their plan
   */
  async canAddDestination(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUserUsage(userId);

      if (!subscription) {
        // Free plan limits
        return usage.total_destinations < 2;
      }

      return usage.total_destinations < subscription.max_simultaneous_destinations;
    } catch (error) {
      console.error('Error checking destination limit:', error);
      return false;
    }
  }

  /**
   * Get current billing period
   */
  getCurrentBillingPeriod() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return { start, end };
  }

  /**
   * Update user usage metrics
   */
  async updateUsage(userId, metrics) {
    try {
      const currentPeriod = this.getCurrentBillingPeriod();

      await this.db.run(
        `INSERT INTO usage_tracking
         (user_id, streaming_hours_used, active_stream_sources, total_destinations, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, period_start)
         DO UPDATE SET
           streaming_hours_used = EXCLUDED.streaming_hours_used,
           active_stream_sources = EXCLUDED.active_stream_sources,
           total_destinations = EXCLUDED.total_destinations,
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          metrics.streaming_hours_used || 0,
          metrics.active_stream_sources || 0,
          metrics.total_destinations || 0,
          currentPeriod.start,
          currentPeriod.end
        ]
      );
    } catch (error) {
      console.error('Error updating usage metrics:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();