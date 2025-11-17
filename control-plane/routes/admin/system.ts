import express, { Request, Response } from "express";
import Database from "../../lib/database";
import currencyService from "../../services/currencyService";
import {
  detectCurrency,
  getCurrencyContext,
} from "../../middleware/currencyMiddleware";

const router = express.Router();
const db = new Database();

// Get system health
router.get("/health", async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    const dbTest = await db.query<any>("SELECT 1 as test");

    // Check recent stream activity
    const recentActivity = await db.query<any>(`
      SELECT COUNT(*) as count
      FROM active_streams
      WHERE started_at > NOW() - INTERVAL '5 minutes'
    `);

    res.json({
      data: {
        status: "healthy",
        database: dbTest.length > 0 ? "connected" : "disconnected",
        recentActivity: parseInt(recentActivity[0].count),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    res.status(500).json({
      data: {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Get current currency context (for debugging/admin info)
router.get("/currency/context", detectCurrency, async (req: Request, res: Response): Promise<void> => {
  try {
    const currencyContext = getCurrencyContext(req);

    res.json({
      data: currencyContext,
    });
  } catch (error: any) {
    console.error("Get currency context error:", error);
    res.status(500).json({ error: "Failed to fetch currency context" });
  }
});

// Update exchange rate (admin only)
router.post("/currency/exchange-rate", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      rate,
      from_currency = "USD",
      to_currency = "INR",
    } = req.body as {
      rate: number;
      from_currency?: string;
      to_currency?: string;
    };

    if (!rate || rate <= 0) {
      res.status(400).json({
        error: "Invalid exchange rate",
      });
      return;
    }

    await currencyService.updateExchangeRate(
      rate,
      from_currency as any,
      to_currency as any,
    );

    res.json({
      data: {
        rate,
        from_currency,
        to_currency,
        message: "Exchange rate updated successfully",
      },
    });
  } catch (error: any) {
    console.error("Update exchange rate error:", error);
    res.status(500).json({ error: "Failed to update exchange rate" });
  }
});

export default router;
