const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { detectCurrency, requireCurrencyContext, getCurrencyContext } = require('../middleware/currencyMiddleware');
const paymentService = require('../services/paymentService');

const router = express.Router();

/**
 * Create a Razorpay order for subscription payment
 */
router.post('/create-order', authenticateToken, detectCurrency, async (req, res) => {
  try {
    const { plan_id, billing_cycle = 'monthly' } = req.body;
    const currencyContext = getCurrencyContext(req);

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    const order = await paymentService.createOrder(req.user.id, plan_id, billing_cycle, currencyContext.currency);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
});

/**
 * Verify and handle successful payment
 */
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Order ID, Payment ID, and Signature are required'
      });
    }

    const result = await paymentService.handleSuccessfulPayment(order_id, payment_id, signature);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
});

/**
 * Get user's payment history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await paymentService.getUserPaymentHistory(req.user.id);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    });
  }
});

/**
 * Get payment order details
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await paymentService.getOrderDetails(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Ensure user can only access their own orders
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get order details'
    });
  }
});

/**
 * Handle Razorpay webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const event = webhookBody.event;
    const payload = webhookBody.payload;

    console.log(`🪝 Received Razorpay webhook: ${event}`, payload);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment captured successfully
        // We already handle this in the frontend, but this is a backup
        console.log('💰 Payment captured via webhook:', payload.payment.entity.id);
        break;

      case 'payment.failed':
        // Payment failed
        console.log('❌ Payment failed via webhook:', payload.payment.entity.id);
        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        console.log('📝 Subscription cancelled via webhook:', payload.subscription.entity.id);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event}`);
    }

    res.json({
      success: true,
      message: 'Webhook received'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

module.exports = router;