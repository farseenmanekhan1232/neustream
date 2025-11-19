import express, { Request, Response } from "express";
import Database from "../../lib/database";
import { handleGenericIdParam } from "../../middleware/idHandler";

const router = express.Router();
const db = new Database();

// Get all users with their streaming info
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.query<any>(`
      SELECT
        u.id,
        u.email,
        u.display_name,
        u.avatar_url,
        u.oauth_provider,
        u.stream_key,
        u.created_at,
        COALESCE(ss.source_count, 0) as total_sources,
        COALESCE(active.active_count, 0) as active_streams
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as source_count
        FROM stream_sources
        WHERE is_active = true
        GROUP BY user_id
      ) ss ON u.id = ss.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as active_count
        FROM active_streams
        WHERE ended_at IS NULL
        GROUP BY user_id
      ) active ON u.id = active.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({ data: users });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get specific user details with their sources and streams
router.get(
  "/:id",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // User info is already available from middleware
      const user = (req as any).entity;
      const isUuid = (req as any).isUuid || false;
      const userParam = isUuid ? user.uuid : user.id;

      // Get user's stream sources
      const sources = await db.query<any>(
        `
      SELECT
        ss.*,
        COUNT(sd.id) as destinations_count,
        EXISTS(
          SELECT 1 FROM active_streams
          WHERE source_id = ss.id AND ended_at IS NULL
        ) as is_active
      FROM stream_sources ss
      LEFT JOIN source_destinations sd ON ss.id = sd.source_id
      WHERE ${isUuid ? "ss.user_uuid = $1" : "ss.user_id = $1"}
      GROUP BY ss.id
      ORDER BY ss.created_at DESC
    `,
        [userParam],
      );

      // Get user's active streams
      const activeStreams = await db.query<any>(
        `
      SELECT
        as_.*,
        ss.name as source_name
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      WHERE ${isUuid ? "as_.user_uuid = $1" : "as_.user_id = $1"} AND as_.ended_at IS NULL
      ORDER BY as_.started_at DESC
    `,
        [userParam],
      );

      // Get stream statistics
      const streamStats = await db.query<any>(
        `
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE ${isUuid ? "user_uuid = $1" : "user_id = $1"} AND ended_at IS NOT NULL
    `,
        [userParam],
      );

      res.json({
        data: {
          user: {
            ...user,
            sources,
            activeStreams,
            stats: {
              totalStreams: parseInt(streamStats[0]?.total_streams) || 0,
              avgDuration: parseFloat(streamStats[0]?.avg_duration) || 0,
            },
          },
        },
      });
    } catch (error: any) {
      console.error("Get user details error:", error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  },
);

// Update user (basic info)
router.put(
  "/:id",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { displayName, isActive } = req.body as {
      displayName?: string;
      isActive?: boolean;
    };

    try {
      // User exists check is already handled by middleware
      const user = (req as any).entity;

      // Update user (limited fields for admin)
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (displayName !== undefined) {
        updates.push(`display_name = $${paramIndex++}`);
        params.push(displayName);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: "No valid fields to update" });
        return;
      }

      params.push(id);

      const result = await db.query<any>(
        `UPDATE users SET ${updates.join(
          ", ",
        )} WHERE id = $${paramIndex} RETURNING *`,
        params,
      );

      res.json({ data: result[0] });
    } catch (error: any) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  },
);

// Delete user (with cascading deletes)
router.delete(
  "/:id",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // User exists check is already handled by middleware
      const user = (req as any).entity;

      // Check if user has active streams
      const activeStreams = await db.query<any>(
        "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
        [id],
      );

      if (parseInt(activeStreams[0].count) > 0) {
        res
          .status(400)
          .json({ error: "Cannot delete user with active streams" });
        return;
      }

      // Delete user (cascades to sources, destinations, etc.)
      await db.query("DELETE FROM users WHERE id = $1", [id]);

      res.json({
        message: "User deleted successfully",
        userEmail: user.email,
      });
    } catch (error: any) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

// Suspend user
router.post(
  "/:id/suspend",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // User exists check is already handled by middleware
      const user = (req as any).entity;

      // Check if user has active streams
      const activeStreams = await db.query<any>(
        "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
        [id],
      );

      if (parseInt(activeStreams[0].count) > 0) {
        res
          .status(400)
          .json({ error: "Cannot suspend user with active streams" });
        return;
      }

      // Deactivate all user's stream sources
      await db.run(
        "UPDATE stream_sources SET is_active = false WHERE user_id = $1",
        [id],
      );

      // Update user with suspended flag (using display_name to store suspension info)
      await db.run(
        "UPDATE users SET display_name = CASE WHEN display_name LIKE '[SUSPENDED]%' THEN display_name ELSE '[SUSPENDED] ' || COALESCE(display_name, email) END WHERE id = $1",
        [id],
      );

      res.json({ message: "User suspended successfully" });
    } catch (error: any) {
      console.error("Suspend user error:", error);
      res.status(500).json({ error: "Failed to suspend user" });
    }
  },
);

// Unsuspend user
router.post(
  "/:id/unsuspend",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // User exists check is already handled by middleware
      const user = (req as any).entity;

      // Remove suspension prefix from display_name
      await db.run(
        "UPDATE users SET display_name = CASE WHEN display_name LIKE '[SUSPENDED]%' THEN SUBSTRING(display_name, 12) ELSE display_name END WHERE id = $1",
        [id],
      );

      res.json({ message: "User unsuspended successfully" });
    } catch (error: any) {
      console.error("Unsuspend user error:", error);
      res.status(500).json({ error: "Failed to unsuspend user" });
    }
  },
);

// Reset user stream key
router.post(
  "/:id/reset-stream-key",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const crypto = require("crypto");

    try {
      // User exists check is already handled by middleware
      const user = (req as any).entity;

      // Check if user has active streams
      const activeStreams = await db.query<any>(
        "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
        [id],
      );

      if (parseInt(activeStreams[0].count) > 0) {
        res.status(400).json({
          error: "Cannot reset stream key while user has active streams",
        });
        return;
      }

      // Generate unique stream key
      let streamKey: string = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        streamKey = crypto.randomBytes(24).toString("hex");

        // Check uniqueness in destinations and users tables
        const existingInUsers = await db.query<any>(
          "SELECT id FROM users WHERE stream_key = $1 AND id != $2",
          [streamKey, id],
        );

        if (existingInUsers.length === 0) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        res.status(500).json({ error: "Failed to generate unique stream key" });
        return;
      }

      // Update user stream key
      await db.run("UPDATE users SET stream_key = $1 WHERE id = $2", [
        streamKey,
        id,
      ]);

      res.json({
        message: "Stream key reset successfully",
        streamKey: streamKey,
      });
    } catch (error: any) {
      console.error("Reset stream key error:", error);
      res.status(500).json({ error: "Failed to reset stream key" });
    }
  },
);

// Get user's current usage limits
router.get(
  "/:id/limits",
  handleGenericIdParam("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // Get user's current subscription and limits
      const result = await db.query<any>(
        `
        SELECT
          us.*,
          (sp.limits->>'max_sources')::integer as max_sources,
          (sp.limits->>'max_destinations')::integer as max_destinations,
          (sp.limits->>'max_streaming_hours_monthly')::integer as max_streaming_hours_monthly,
          plt.current_sources_count,
          plt.current_destinations_count,
          plt.current_month_streaming_hours
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        LEFT JOIN plan_limits_tracking plt ON us.user_id = plt.user_id
        WHERE us.user_id = $1 AND us.status = 'active'
      `,
        [id],
      );

      if (result.length === 0) {
        res.status(404).json({ error: "No active subscription found" });
        return;
      }

      res.json({ data: result[0] });
    } catch (error: any) {
      console.error("Get user limits error:", error);
      res.status(500).json({ error: "Failed to fetch user limits" });
    }
  },
);

// Note: plan_limits_tracking table only tracks current usage counts, not limit overrides.
// The actual limits come from subscription_plans.limits JSONB field.
// For limit overrides, use the subscription service's limit override functionality.

export default router;
