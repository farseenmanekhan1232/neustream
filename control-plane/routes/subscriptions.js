const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserPlanInfo } = require('../middleware/planValidation');
const subscriptionService = require('../services/subscriptionService');

const router = express.Router();

/**
 * Get user's current subscription and usage
 */
router.get('/usage', authenticateToken, getUserPlanInfo, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.userPlan
    });
  } catch (error) {
    console.error('Error getting subscription usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription usage'
    });
  }
});

/**
 * Get available subscription plans
 */
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const plans = await subscriptionService.getAvailablePlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription plans'
    });
  }
});

/**
 * Get user's streaming history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await subscriptionService.getStreamingHistory(req.user.id, parseInt(limit));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting streaming history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streaming history'
    });
  }
});

/**
 * Get monthly usage breakdown
 */
router.get('/usage/breakdown', authenticateToken, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const breakdown = await subscriptionService.getMonthlyUsageBreakdown(req.user.id, parseInt(months));

    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Error getting usage breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage breakdown'
    });
  }
});

/**
 * Check if user can create a source
 */
router.get('/limits/sources', authenticateToken, async (req, res) => {
  try {
    const canCreate = await subscriptionService.canCreateSource(req.user.id);

    res.json({
      success: true,
      data: canCreate
    });
  } catch (error) {
    console.error('Error checking source limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check source limits'
    });
  }
});

/**
 * Check if user can create a destination
 */
router.get('/limits/destinations', authenticateToken, async (req, res) => {
  try {
    const canCreate = await subscriptionService.canCreateDestination(req.user.id);

    res.json({
      success: true,
      data: canCreate
    });
  } catch (error) {
    console.error('Error checking destination limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check destination limits'
    });
  }
});

/**
 * Check if user can stream
 */
router.get('/limits/streaming', authenticateToken, async (req, res) => {
  try {
    const canStream = await subscriptionService.canStream(req.user.id);

    res.json({
      success: true,
      data: canStream
    });
  } catch (error) {
    console.error('Error checking streaming limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check streaming limits'
    });
  }
});

/**
 * Update user's subscription (for testing/admin purposes)
 * In production, this would be handled by webhooks from payment provider
 */
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const { plan_id, billing_cycle = 'monthly' } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    await subscriptionService.updateUserSubscription(req.user.id, plan_id, billing_cycle);

    res.json({
      success: true,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
});

module.exports = router;