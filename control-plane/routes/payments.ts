import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { detectCurrency, requireCurrencyContext, getCurrencyContext } from "../middleware/currencyMiddleware";
import paymentService from "../services/paymentService";

const router = express.Router();

/**
 * Create a Razorpay order for subscription payment
 */
router.post('/create-order', authenticateToken, detectCurrency, async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan_id, billing_cycle = 'monthly' } = req.body as { plan_id: number; billing_cycle?: string };
    const currencyContext = getCurrencyContext(req);

    if (!plan_id) {
      res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
      return;
    }

    const order = await paymentService.createOrder((req as any).user.id, plan_id, billing_cycle, currencyContext.currency);

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
router.post('/verify-payment', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id, payment_id, signature } = req.body as { order_id: string; payment_id: string; signature: string };

    if (!order_id || !payment_id || !signature) {
      res.status(400).json({
        success: false,
        error: 'Order ID, Payment ID, and Signature are required'
      });
      return;
    }

    const result = await paymentService.handleSuccessfulPayment(order_id, payment_id, signature);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
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
router.get('/history', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await paymentService.getUserPaymentHistory((req as any).user.id);

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
router.get('/order/:orderId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await paymentService.getOrderDetails(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Ensure user can only access their own orders
    if (order.user_id !== (req as any).user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
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
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
      return;
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

export default router;
