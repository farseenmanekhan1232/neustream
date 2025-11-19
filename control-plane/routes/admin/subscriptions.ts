import express, { Request, Response } from "express";
import Database from "../../lib/database";
import subscriptionService from "../../services/subscriptionService";
import {
  handleUserIdParam,
  handleGenericIdParam,
} from "../../middleware/idHandler";

const router = express.Router();
const db = new Database();

// Get all subscription plans
router.get("/plans", async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await db.query<any>(
      `SELECT
         sp.*,
         COUNT(us.id) as active_subscriptions
       FROM subscription_plans sp
       LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
       GROUP BY sp.id
       ORDER BY sp.price_monthly ASC`,
    );

    res.json({ data: plans });
  } catch (error: any) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
});

// Create new subscription plan
router.post("/plans", async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    description,
    price_monthly,
    price_yearly,
    price_monthly_inr,
    price_yearly_inr,
    max_sources,
    max_destinations,
    max_streaming_hours_monthly,
    features,
  } = req.body as any;

  try {
    // Use limits JSONB instead of individual columns
    const result = await db.run<any>(
      `INSERT INTO subscription_plans (
        name, description, price_monthly, price_yearly, currency,
        features, limits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        name,
        description,
        price_monthly,
        price_yearly,
        "USD",
        JSON.stringify(features || []),
        JSON.stringify({
          price_monthly_inr,
          price_yearly_inr,
          max_sources,
          max_destinations,
          max_streaming_hours_monthly,
        }),
      ],
    );

    res.status(201).json({ data: result });
  } catch (error: any) {
    console.error("Create subscription plan error:", error);
    res.status(500).json({ error: "Failed to create subscription plan" });
  }
});

// Update subscription plan
router.put(
  "/plans/:id",
  handleGenericIdParam("subscription_plans"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
      name,
      description,
      price_monthly,
      price_yearly,
      price_monthly_inr,
      price_yearly_inr,
      max_sources,
      max_destinations,
      max_streaming_hours_monthly,
      features,
    } = (req.body as any).planData || req.body; // Handle both nested and direct data

    try {
      // Plan exists check is already handled by middleware
      const plan = (req as any).entity;

      // Use limits JSONB
      const result = await db.run<any>(
        `UPDATE subscription_plans SET
        name = $1,
        description = $2,
        price_monthly = $3,
        price_yearly = $4,
        features = $5,
        limits = $6
      WHERE id = $7 RETURNING *`,
        [
          name,
          description,
          price_monthly,
          price_yearly,
          JSON.stringify(features || []),
          JSON.stringify({
            price_monthly_inr,
            price_yearly_inr,
            max_sources,
            max_destinations,
            max_streaming_hours_monthly,
          }),
          plan.id,
        ],
      );

      // Check if update was successful
      if (!result) {
        res.status(404).json({ error: "Subscription plan not found" });
        return;
      }

      res.json({ data: result });
    } catch (error: any) {
      console.error("Update subscription plan error:", {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        params: req.params,
      });
      res.status(500).json({
        error: "Failed to update subscription plan",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Delete subscription plan
router.delete(
  "/plans/:id",
  handleGenericIdParam("subscription_plans"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Plan exists check is already handled by middleware
      const plan = (req as any).entity;

      // Check if plan has active subscriptions
      const activeSubscriptions = await db.query<any>(
        "SELECT COUNT(*) as count FROM user_subscriptions WHERE plan_id = $1 AND status = 'active'",
        [plan.id],
      );

      if (parseInt(activeSubscriptions[0].count) > 0) {
        res.status(400).json({
          error:
            "Cannot delete plan with active subscriptions. Please migrate users to other plans first.",
        });
        return;
      }

      const result = await db.run<any>(
        "DELETE FROM subscription_plans WHERE id = $1 RETURNING *",
        [plan.id],
      );

      // Check if delete was successful
      if (!result) {
        res.status(404).json({ error: "Subscription plan not found" });
        return;
      }

      res.json({ message: "Subscription plan deleted successfully" });
    } catch (error: any) {
      console.error("Delete subscription plan error:", error);
      res.status(500).json({ error: "Failed to delete subscription plan" });
    }
  },
);

// Get user subscriptions with usage data
router.get("/user-subscriptions", async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, search = "" } = req.query as any;
  const offset = (page - 1) * limit;

  try {
    // Get subscriptions with user and plan details
    const subscriptions = await db.query<any>(
      `SELECT
         us.*,
         u.email,
         u.display_name,
         u.avatar_url,
         u.oauth_provider,
         sp.name as plan_name,
         sp.price_monthly,
         sp.price_yearly,
         plt.current_sources_count as sources_count,
         plt.current_destinations_count as destinations_count,
         plt.current_month_streaming_hours as streaming_hours
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN subscription_plans sp ON us.plan_id = sp.id
       LEFT JOIN plan_limits_tracking plt ON us.user_id = plt.user_id
       WHERE u.email ILIKE $1 OR u.display_name ILIKE $1 OR sp.name ILIKE $1
       ORDER BY us.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset],
    );

    // Get total count for pagination
    const totalCount = await db.query<any>(
      `SELECT COUNT(*) as count
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE u.email ILIKE $1 OR u.display_name ILIKE $1 OR sp.name ILIKE $1`,
      [`%${search}%`],
    );

    res.json({
      data: subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount[0].count),
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error: any) {
    console.error("Get user subscriptions error:", error);
    res.status(500).json({ error: "Failed to fetch user subscriptions" });
  }
});

// Update user subscription
router.put(
  "/user-subscriptions/:userId",
  handleUserIdParam,
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { plan_id, status, current_period_end } = req.body as {
      plan_id: number;
      status: string;
      current_period_end: string;
    };

    try {
      // User exists check is already handled by middleware
      const targetUser = (req as any).targetUser;

      // Check if plan exists
      const planCheck = await db.query<any>(
        "SELECT id FROM subscription_plans WHERE id = $1",
        [plan_id],
      );

      if (planCheck.length === 0) {
        res.status(404).json({ error: "Subscription plan not found" });
        return;
      }

      // Update or create subscription
      const existingSubscription = await db.query<any>(
        "SELECT id FROM user_subscriptions WHERE user_id = $1",
        [targetUser.id],
      );

      let result: any;
      if (existingSubscription.length > 0) {
        // Update existing subscription
        result = await db.run<any>(
          `UPDATE user_subscriptions SET
          plan_id = $1,
          status = $2,
          current_period_end = $3,
          updated_at = NOW()
        WHERE user_id = $4 RETURNING *`,
          [plan_id, status, current_period_end, targetUser.id],
        );
      } else {
        // Create new subscription
        result = await db.run<any>(
          `INSERT INTO user_subscriptions (
          user_id, plan_id, status, current_period_start, current_period_end
        ) VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
          [targetUser.id, plan_id, status, current_period_end],
        );
      }

      res.json({ data: result });
    } catch (error: any) {
      console.error("Update user subscription error:", error);
      res.status(500).json({ error: "Failed to update user subscription" });
    }
  },
);

// Promote/Demote user subscription with audit logging
router.put(
  "/user-subscriptions/:userId/promote-demote",
  handleUserIdParam,
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const {
      plan_id,
      reason,
      effective_date = "immediate",
    } = req.body as {
      plan_id: number;
      reason: string;
      effective_date?: "immediate" | "next_billing";
    };

    try {
      // User exists check is already handled by middleware
      const targetUser = (req as any).targetUser;
      const adminId = (req as any).user.id;

      // Get current subscription
      const currentSubscription = await db.query<any>(
        `SELECT us.*, sp.name as plan_name, sp.price_monthly
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 AND us.status = 'active'`,
        [targetUser.id],
      );

      if (currentSubscription.length === 0) {
        res.status(404).json({ error: "No active subscription found" });
        return;
      }

      const currentPlan = currentSubscription[0];

      // Check if new plan exists
      const newPlan = await db.query<any>(
        "SELECT * FROM subscription_plans WHERE id = $1",
        [plan_id],
      );

      if (newPlan.length === 0) {
        res.status(404).json({ error: "Subscription plan not found" });
        return;
      }

      const newPlanData = newPlan[0];

      // Determine if promotion or demotion
      const isPromotion = newPlanData.price_monthly > currentPlan.price_monthly;
      const changeType = isPromotion ? "promotion" : "demotion";

      // Update subscription
      const result = await db.run<any>(
        `UPDATE user_subscriptions SET
        plan_id = $1,
        updated_at = NOW()
      WHERE user_id = $2 AND status = 'active' RETURNING *`,
        [plan_id, targetUser.id],
      );

      // Log the subscription change
      await db.run(
        `INSERT INTO subscription_change_logs (
        user_id, from_plan_id, to_plan_id, change_type,
        reason, admin_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          targetUser.id,
          currentPlan.plan_id,
          plan_id,
          changeType,
          reason,
          adminId,
        ],
      );

      res.json({
        success: true,
        message: `User ${changeType}d from ${currentPlan.plan_name} to ${newPlanData.name}`,
        data: result,
        change_type: changeType,
        previous_plan: currentPlan.plan_name,
        new_plan: newPlanData.name,
      });
    } catch (error: any) {
      console.error("Promote/demote subscription error:", error);
      res.status(500).json({ error: "Failed to update user subscription" });
    }
  },
);

// Get all active limit overrides
router.get("/limit-overrides", async (req: Request, res: Response): Promise<void> => {
  try {
    const overrides = await subscriptionService.getAllLimitOverrides();
    res.json({ data: overrides });
  } catch (error: any) {
    console.error("Get limit overrides error:", error);
    res.status(500).json({ error: "Failed to fetch limit overrides" });
  }
});

// Get limit overrides for a specific user
router.get(
  "/users/:id/limits/overrides",
  handleUserIdParam,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const targetUser = (req as any).targetUser;
      const overrides = await subscriptionService.getUserLimitOverrides(targetUser.id);
      res.json({ data: overrides });
    } catch (error: any) {
      console.error("Get user limit overrides error:", error);
      res.status(500).json({ error: "Failed to fetch user limit overrides" });
    }
  },
);

// Set a limit override for a user
router.post(
  "/users/:id/limits/override",
  handleUserIdParam,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { limit_type, value, reason, expires_at } = req.body as {
      limit_type: string;
      value: number;
      reason: string;
      expires_at?: string;
    };

    try {
      const targetUser = (req as any).targetUser;
      const adminId = (req as any).user.id;

      // Validate required fields
      if (!limit_type || value === undefined || !reason) {
        res
          .status(400)
          .json({
            error: "Missing required fields: limit_type, value, reason",
          });
        return;
      }

      // Call subscription service
      await subscriptionService.setUserLimitOverride(
        targetUser.id,
        limit_type,
        value,
        reason,
        adminId,
        expires_at ? new Date(expires_at) : undefined,
      );

      res.json({
        success: true,
        message: `Limit override set for ${targetUser.email}`,
        data: { limit_type, value },
      });
    } catch (error: any) {
      console.error("Set limit override error:", error);
      res
        .status(500)
        .json({ error: "Failed to set limit override: " + error.message });
    }
  },
);

// Remove a limit override for a user
router.delete(
  "/users/:id/limits/override/:limitType",
  handleUserIdParam,
  async (req: Request, res: Response): Promise<void> => {
    const { id, limitType } = req.params;

    try {
      const targetUser = (req as any).targetUser;

      await subscriptionService.removeUserLimitOverride(
        targetUser.id,
        limitType,
      );

      res.json({
        success: true,
        message: `Limit override removed for ${targetUser.email}`,
        data: { limit_type: limitType },
      });
    } catch (error: any) {
      console.error("Remove limit override error:", error);
      res.status(500).json({ error: "Failed to remove limit override" });
    }
  },
);

export default router;
