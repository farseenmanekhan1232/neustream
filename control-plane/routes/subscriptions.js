const express = require('express');
const Database = require('../lib/database');
const subscriptionService = require('../services/subscription');

const router = express.Router();

// Create a shared database instance for all routes
const db = new Database();

// Pre-connect to database when the module loads
db.connect().catch(err => {
  console.error('Failed to pre-connect to database:', err);
});

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get all available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await subscriptionService.getPlans();
    res.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Get user's current subscription
router.get('/my-subscription', requireAuth, async (req, res) => {
  try {
    const subscription = await subscriptionService.getUserSubscription(req.user.id);
    const usage = await subscriptionService.getUserUsage(req.user.id);

    res.json({
      subscription,
      usage,
      limits: {
        canCreateStreamSource: await subscriptionService.canCreateStreamSource(req.user.id),
        canAddDestination: await subscriptionService.canAddDestination(req.user.id)
      }
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription information' });
  }
});

// Create a new subscription
router.post('/subscribe', requireAuth, async (req, res) => {
  const { planId, billingCycle = 'monthly' } = req.body;

  try {
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await subscriptionService.getUserSubscription(req.user.id);
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    const result = await subscriptionService.createSubscription(req.user.id, planId, billingCycle);

    res.json({
      subscription: result.subscription,
      checkout_url: result.checkout_url,
      message: 'Subscription created successfully. Please complete the payment to activate your subscription.'
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.user.id);

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get subscription usage
router.get('/usage', requireAuth, async (req, res) => {
  try {
    const usage = await subscriptionService.getUserUsage(req.user.id);
    res.json({ usage });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage information' });
  }
});

// Check plan limits
router.get('/limits', requireAuth, async (req, res) => {
  try {
    const limits = {
      canCreateStreamSource: await subscriptionService.canCreateStreamSource(req.user.id),
      canAddDestination: await subscriptionService.canAddDestination(req.user.id)
    };

    res.json({ limits });
  } catch (error) {
    console.error('Error checking limits:', error);
    res.status(500).json({ error: 'Failed to check plan limits' });
  }
});

// Razorpay webhook handler
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature (implement proper signature verification in production)
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // In production, verify the signature using Razorpay's utility
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', webhookSecret)
    //   .update(JSON.stringify(req.body))
    //   .digest('hex');
    //
    // if (expectedSignature !== razorpaySignature) {
    //   return res.status(401).json({ error: 'Invalid webhook signature' });
    // }

    await subscriptionService.handleWebhook(req.body);

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get user's payment history
router.get('/payments', requireAuth, async (req, res) => {
  try {
    const payments = await db.query(
      `SELECT * FROM payment_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;