import express, { Request, Response } from "express";
import { authenticateToken } from "../../middleware/auth";

// Admin middleware - check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function): void => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || ["admin@neustream.app"];
  const userEmail = (req as any).user?.email;

  if (!adminEmails.includes(userEmail)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

// Import all admin route modules
import usersRouter from "./users";
import sourcesRouter from "./sources";
import destinationsRouter from "./destinations";
import subscriptionsRouter from "./subscriptions";
import analyticsRouter from "./analytics";
import streamsRouter from "./streams";
import systemRouter from "./system";
import paymentsRouter from "./payments";
import monitoringRouter from "./monitoring";
import chatRouter from "./chat";

const router = express.Router();

// Apply authentication and admin check to all admin routes
router.use(authenticateToken, requireAdmin);

// Mount all admin route modules
router.use("/users", usersRouter);
router.use("/sources", sourcesRouter);
router.use("/destinations", destinationsRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/analytics", analyticsRouter); // Analytics routes at /api/admin/analytics/*
router.use("/streams", streamsRouter);
router.use("/system", systemRouter);
router.use("/payments", paymentsRouter);
router.use("/monitoring", monitoringRouter);
router.use("/chat-connectors", chatRouter);

// Health check endpoint for admin API
router.get("/ping", (req: Request, res: Response): void => {
  res.json({
    data: {
      message: "Admin API is running",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
