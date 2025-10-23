const Razorpay = require("razorpay");
const Database = require("../lib/database");
const subscriptionService = require("./subscriptionService");

class PaymentService {
  constructor() {
    this.db = new Database();
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a Razorpay order for subscription payment
   */
  async createOrder(userId, planId, billingCycle = "monthly") {
    try {
      // Get plan details
      const plan = await this.db.query(
        "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true",
        [planId]
      );

      if (plan.length === 0) {
        throw new Error("Subscription plan not found");
      }

      const planData = plan[0];
      const amount =
        billingCycle === "yearly"
          ? planData.price_yearly * 100
          : planData.price_monthly * 100; // Amount in paise

      // Create Razorpay order
      const orderOptions = {
        amount: Math.round(amount), // Amount in paise
        currency: "USD",
        receipt: `sub_${userId}_${planId}_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          planId: planId.toString(),
          billingCycle: billingCycle,
          planName: planData.name,
        },
      };

      console.log("📦 Creating Razorpay order:", orderOptions);
      const order = await this.razorpay.orders.create(orderOptions);

      // Store order in database
      await this.db.query(
        `
        INSERT INTO payment_orders (
          order_id, user_id, plan_id, billing_cycle, amount, currency, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'created', NOW())
      `,
        [order.id, userId, planId, billingCycle, amount / 100, "INR"]
      );

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        name: "Neustream",
        description: `${planData.name} Subscription`,
        prefill: {
          name: "", // Will be filled by frontend
          email: "", // Will be filled by frontend
        },
        theme: {
          color: "#2563eb",
        },
      };
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Error verifying payment signature:", error);
      return false;
    }
  }

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(orderId, paymentId, signature) {
    try {
      // Verify payment signature
      if (!this.verifyPaymentSignature(orderId, paymentId, signature)) {
        throw new Error("Invalid payment signature");
      }

      // Get order details from database
      const order = await this.db.query(
        "SELECT * FROM payment_orders WHERE order_id = $1",
        [orderId]
      );

      if (order.length === 0) {
        throw new Error("Order not found");
      }

      const orderData = order[0];

      // Verify payment with Razorpay
      const payment = await this.razorpay.payments.fetch(paymentId);

      if (payment.status !== "captured") {
        throw new Error("Payment not captured");
      }

      // Update order status
      await this.db.query(
        `
        UPDATE payment_orders
        SET payment_id = $1, status = 'completed', updated_at = NOW()
        WHERE order_id = $2
      `,
        [paymentId, orderId]
      );

      // Update user subscription
      await subscriptionService.updateUserSubscription(
        orderData.user_id,
        orderData.plan_id,
        orderData.billing_cycle
      );

      // Create payment record
      await this.db.query(
        `
        INSERT INTO payments (
          user_id, plan_id, billing_cycle, amount, currency,
          payment_id, order_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', NOW())
      `,
        [
          orderData.user_id,
          orderData.plan_id,
          orderData.billing_cycle,
          orderData.amount,
          orderData.currency,
          paymentId,
          orderId,
        ]
      );

      console.log(
        `✅ Payment completed successfully for user ${orderData.user_id}, order ${orderId}`
      );

      return {
        success: true,
        orderId: orderId,
        paymentId: paymentId,
        userId: orderData.user_id,
        planId: orderData.plan_id,
      };
    } catch (error) {
      console.error("Error handling successful payment:", error);

      // Update order status to failed
      await this.db.query(
        `
        UPDATE payment_orders
        SET status = 'failed', updated_at = NOW()
        WHERE order_id = $1
      `,
        [orderId]
      );

      throw error;
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPaymentHistory(userId) {
    try {
      const payments = await this.db.query(
        `
        SELECT
          p.*,
          sp.name as plan_name
        FROM payments p
        JOIN subscription_plans sp ON p.plan_id = sp.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT 50
      `,
        [userId]
      );

      return payments;
    } catch (error) {
      console.error("Error getting payment history:", error);
      throw error;
    }
  }

  /**
   * Get payment order details
   */
  async getOrderDetails(orderId) {
    try {
      const order = await this.db.query(
        `
        SELECT
          po.*,
          sp.name as plan_name,
          sp.price_monthly,
          sp.price_yearly
        FROM payment_orders po
        JOIN subscription_plans sp ON po.plan_id = sp.id
        WHERE po.order_id = $1
      `,
        [orderId]
      );

      return order[0] || null;
    } catch (error) {
      console.error("Error getting order details:", error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
