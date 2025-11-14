import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { getUserPlanInfo } from "../middleware/planValidation";
import { detectCurrency, requireCurrencyContext, getCurrencyContext } from "../middleware/currencyMiddleware";
import subscriptionService from "../services/subscriptionService";

const router = express.Router();

/**
 * Get user's current subscription and usage with currency support
 */
router.get("/usage", authenticateToken, detectCurrency, getUserPlanInfo, async (req: Request, res: Response): Promise<void> => {
  try {
    const currencyContext = getCurrencyContext(req);

    res.json({
      success: true,
      data: {
        ...req.userPlan,
        currency: currencyContext.currency,
        location: currencyContext.location
      },
    });
  } catch (error) {
    console.error("Error getting subscription usage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get subscription usage",
    });
  }
});

/**
 * Get available subscription plans with currency support
 */
router.get("/plans", detectCurrency, async (req: Request, res: Response): Promise<void> => {
  try {
    const currencyContext = getCurrencyContext(req);
    const plans = await subscriptionService.getAvailablePlans(currencyContext.currency);

    res.json({
      success: true,
      data: {
        plans,
        currency: currencyContext.currency,
        location: currencyContext.location
      },
    });
  } catch (error) {
    console.error("Error getting subscription plans:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get subscription plans",
    });
  }
});

/**
 * Get user's streaming history
 */
router.get("/history", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50 } = req.query as any;
    const history = await subscriptionService.getStreamingHistory(
      (req as any).user.id,
      parseInt(limit.toString())
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error getting streaming history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get streaming history",
    });
  }
});

/**
 * Get monthly usage breakdown
 */
router.get("/usage/breakdown", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { months = 6 } = req.query as any;
    const breakdown = await subscriptionService.getMonthlyUsageBreakdown(
      (req as any).user.id,
      parseInt(months.toString())
    );

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    console.error("Error getting usage breakdown:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get usage breakdown",
    });
  }
});

/**
 * Check if user can create a source
 */
router.get("/limits/sources", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const canCreate = await subscriptionService.canCreateSource((req as any).user.id);

    res.json({
      success: true,
      data: canCreate,
    });
  } catch (error) {
    console.error("Error checking source limits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check source limits",
    });
  }
});

/**
 * Check if user can create a destination
 */
router.get("/limits/destinations", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const canCreate = await subscriptionService.canCreateDestination(
      (req as any).user.id
    );

    res.json({
      success: true,
      data: canCreate,
    });
  } catch (error) {
    console.error("Error checking destination limits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check destination limits",
    });
  }
});

/**
 * Check if user can stream
 */
router.get("/limits/streaming", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const canStream = await subscriptionService.canStream((req as any).user.id);

    res.json({
      success: true,
      data: canStream,
    });
  } catch (error) {
    console.error("Error checking streaming limits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check streaming limits",
    });
  }
});

/**
 * Check if user can create a chat connector
 */
router.get("/limits/chat-connectors", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const canCreate = await subscriptionService.canCreateChatConnector((req as any).user.id);

    res.json({
      success: true,
      data: canCreate,
    });
  } catch (error) {
    console.error("Error checking chat connector limits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check chat connector limits",
    });
  }
});

/**
 * Update user's subscription (for testing/admin purposes)
 * In production, this would be handled by webhooks from payment provider
 */
router.post("/update", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan_id, billing_cycle = "monthly" } = req.body as { plan_id: number; billing_cycle?: string };

    if (!plan_id) {
      res.status(400).json({
        success: false,
        error: "Plan ID is required",
      });
      return;
    }

    await subscriptionService.updateUserSubscription(
      (req as any).user.id,
      plan_id,
      billing_cycle
    );

    res.json({
      success: true,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update subscription",
    });
  }
});

export default router;
