import express, { Request, Response } from "express";
import Database from "../lib/database";
import { authenticateToken } from "../middleware/auth";
import currencyService from "../services/currencyService";
import { detectCurrency, getCurrencyContext } from "../middleware/currencyMiddleware";
import { handleUserIdParam, handleGenericIdParam } from "../middleware/idHandler";
import * as crypto from "crypto";

const router = express.Router();
const db = new Database();

// Admin middleware - check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function): void => {
  if ((req as any).user.email !== "admin@neustream.app") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateToken, requireAdmin);

// Get all users with their streaming info
router.get("/users", async (req: Request, res: Response): Promise<void> => {
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

    res.json({ users });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get specific user details with their sources and streams
router.get("/users/:id", handleGenericIdParam('users'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // User info is already available from middleware
    const user = (req as any).entity;

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
      WHERE ${(req as any).isUuid ? 'ss.user_uuid = $1' : 'ss.user_id = $1'}
      GROUP BY ss.id
      ORDER BY ss.created_at DESC
    `,
      [(req as any).isUuid ? user.uuid : user.id]
    );

    // Get user's active streams
    const activeStreams = await db.query<any>(
      `
      SELECT
        as_.*,
        ss.name as source_name
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      WHERE ${(req as any).isUuid ? 'as_.user_uuid = $1' : 'as_.user_id = $1'} AND as_.ended_at IS NULL
      ORDER BY as_.started_at DESC
    `,
      [(req as any).isUuid ? user.uuid : user.id]
    );

    // Get stream statistics
    const streamStats = await db.query<any>(
      `
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE ${(req as any).isUuid ? 'user_uuid = $1' : 'user_id = $1'} AND ended_at IS NOT NULL
    `,
      [(req as any).isUuid ? user.uuid : user.id]
    );

    res.json({
      user: {
        ...user,
        sources,
        activeStreams,
        stats: {
          totalStreams: parseInt(streamStats[0]?.total_streams) || 0,
          avgDuration: parseFloat(streamStats[0]?.avg_duration) || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Get user details error:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Get system statistics
router.get("/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user statistics
    const userStats = await db.query<any>(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_month,
        COUNT(CASE WHEN oauth_provider = 'google' THEN 1 END) as google_users,
        COUNT(CASE WHEN oauth_provider = 'twitch' THEN 1 END) as twitch_users,
        COUNT(CASE WHEN oauth_provider IS NULL THEN 1 END) as email_users
      FROM users
    `);

    // Get stream statistics
    const streamStats = await db.query<any>(`
      SELECT
        COUNT(*) as total_sources,
        COUNT(CASE WHEN ss.is_active = true THEN 1 END) as active_sources,
        COUNT(CASE WHEN ss.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_sources_week
      FROM stream_sources ss
    `);

    // Get active streams
    const activeStreamsCount = await db.query<any>(`
      SELECT COUNT(*) as active_streams
      FROM active_streams
      WHERE ended_at IS NULL
    `);

    // Get destination statistics
    const destStats = await db.query<any>(`
      SELECT
        COUNT(*) as total_destinations,
        COUNT(CASE WHEN platform = 'youtube' THEN 1 END) as youtube_dests,
        COUNT(CASE WHEN platform = 'twitch' THEN 1 END) as twitch_dests,
        COUNT(CASE WHEN platform = 'facebook' THEN 1 END) as facebook_dests
      FROM source_destinations
      WHERE is_active = true
    `);

    // Get recent activity (last 24 hours)
    const recentActivity = await db.query<any>(`
      SELECT
        COUNT(*) as streams_started_24h,
        COUNT(CASE WHEN started_at > NOW() - INTERVAL '1 hour' THEN 1 END) as streams_started_1h
      FROM active_streams
      WHERE started_at > NOW() - INTERVAL '24 hours'
    `);

    res.json({
      users: userStats[0],
      streams: {
        ...streamStats[0],
        activeStreams: parseInt(activeStreamsCount[0]?.active_streams) || 0,
      },
      destinations: destStats[0],
      activity: recentActivity[0],
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch system statistics" });
  }
});

// Get analytics data for charts
router.get("/analytics", async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = "7d" } = req.query as any;

    let interval = "day";
    let periodFilter = "NOW() - INTERVAL '7 days'";

    if (period === "30d") {
      periodFilter = "NOW() - INTERVAL '30 days'";
    } else if (period === "24h") {
      interval = "hour";
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // Get user registration trends
    const userTrends = await db.query<any>(`
      SELECT
        DATE_TRUNC('${interval}', created_at) as period,
        COUNT(*) as users
      FROM users
      WHERE created_at > ${periodFilter}
      GROUP BY DATE_TRUNC('${interval}', created_at)
      ORDER BY period ASC
    `);

    // Get stream activity trends
    const streamTrends = await db.query<any>(`
      SELECT
        DATE_TRUNC('${interval}', started_at) as period,
        COUNT(*) as streams_started,
        COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as streams_completed
      FROM active_streams
      WHERE started_at > ${periodFilter}
      GROUP BY DATE_TRUNC('${interval}', started_at)
      ORDER BY period ASC
    `);

    // Get platform distribution
    const platformDistribution = await db.query<any>(`
      SELECT
        platform,
        COUNT(*) as count
      FROM source_destinations
      WHERE is_active = true
      GROUP BY platform
      ORDER BY count DESC
    `);

    // Get OAuth provider distribution
    const oauthDistribution = await db.query<any>(`
      SELECT
        COALESCE(oauth_provider, 'email') as provider,
        COUNT(*) as count
      FROM users
      GROUP BY COALESCE(oauth_provider, 'email')
      ORDER BY count DESC
    `);

    res.json({
      userTrends,
      streamTrends,
      platformDistribution,
      oauthDistribution,
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// Update user (basic info)
router.put("/users/:id", handleGenericIdParam('users'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { displayName, isActive } = req.body as { displayName?: string; isActive?: boolean };

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
        ", "
      )} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    res.json({ user: result[0] });
  } catch (error: any) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (with cascading deletes)
router.delete("/users/:id", handleGenericIdParam('users'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // User exists check is already handled by middleware
    const user = (req as any).entity;

    // Check if user has active streams
    const activeStreams = await db.query<any>(
      "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      res.status(400).json({ error: "Cannot delete user with active streams" });
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
});

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
      status: "healthy",
      database: dbTest.length > 0 ? "connected" : "disconnected",
      recentActivity: parseInt(recentActivity[0].count),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================
// STREAM SOURCES MANAGEMENT
// ============================================

// Get all stream sources with user info
router.get("/sources", async (req: Request, res: Response): Promise<void> => {
  try {
    const sources = await db.query<any>(`
      SELECT
        ss.*,
        u.email,
        u.display_name,
        COUNT(sd.id) as destinations_count,
        EXISTS(
          SELECT 1 FROM active_streams
          WHERE source_id = ss.id AND ended_at IS NULL
        ) as is_active
      FROM stream_sources ss
      LEFT JOIN users u ON ss.user_id = u.id
      LEFT JOIN source_destinations sd ON ss.id = sd.source_id
      GROUP BY ss.id, u.email, u.display_name
      ORDER BY ss.created_at DESC
    `);

    res.json({ sources });
  } catch (error: any) {
    console.error("Get sources error:", error);
    res.status(500).json({ error: "Failed to fetch stream sources" });
  }
});

// Get specific stream source with destinations
router.get("/sources/:id", handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Stream source is already available from middleware
    const source = (req as any).entity;

    // Get destinations for this source
    const destinations = await db.query<any>(
      `
      SELECT * FROM source_destinations
      WHERE source_id = $1
      ORDER BY created_at DESC
    `,
      [id]
    );

    // Check if currently active
    const activeStream = await db.query<any>(
      `
      SELECT * FROM active_streams
      WHERE source_id = $1 AND ended_at IS NULL
      ORDER BY started_at DESC LIMIT 1
    `,
      [id]
    );

    // Get stream statistics
    const streamStats = await db.query<any>(
      `
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE source_id = $1 AND ended_at IS NOT NULL
    `,
      [id]
    );

    res.json({
      source: {
        ...source,
        is_active: activeStream.length > 0,
        active_stream: activeStream[0] || null,
        stats: {
          totalStreams: parseInt(streamStats[0]?.total_streams) || 0,
          avgDuration: parseFloat(streamStats[0]?.avg_duration) || 0,
        },
      },
      destinations,
    });
  } catch (error: any) {
    console.error("Get source error:", error);
    res.status(500).json({ error: "Failed to fetch stream source" });
  }
});

// Update stream source
router.put("/sources/:id", handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, is_active } = req.body as { name?: string; description?: string; is_active?: boolean };

  try {
    // Source exists check is already handled by middleware
    const existingSource = (req as any).entity;

    // Check if source is currently active before deactivating
    if (is_active === false) {
      const activeStream = await db.query<any>(
        "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
        [id]
      );

      if (activeStream.length > 0) {
        res.status(400).json({ error: "Cannot deactivate source while streaming" });
        return;
      }
    }

    // Update the source
    const result = await db.run<any>(
      "UPDATE stream_sources SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *",
      [name?.trim(), description?.trim(), is_active, id]
    );

    res.json({ source: result });
  } catch (error: any) {
    console.error("Update source error:", error);
    res.status(500).json({ error: "Failed to update stream source" });
  }
});

// Delete stream source
router.delete("/sources/:id", handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Source exists check is already handled by middleware
    const existingSource = (req as any).entity;

    // Check if source is currently active
    const activeStream = await db.query<any>(
      "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (activeStream.length > 0) {
      res.status(400).json({ error: "Cannot delete source while streaming" });
      return;
    }

    // Delete the source (destinations will be deleted due to CASCADE)
    const result = await db.run<any>("DELETE FROM stream_sources WHERE id = $1", [
      id,
    ]);

    if (result.changes === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    res.json({ message: "Stream source deleted successfully" });
  } catch (error: any) {
    console.error("Delete source error:", error);
    res.status(500).json({ error: "Failed to delete stream source" });
  }
});

// Regenerate stream key for source
router.post("/sources/:id/regenerate-key", handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Source exists check is already handled by middleware
    const existingSource = (req as any).entity;

    // Check if source is currently active
    const activeStream = await db.query<any>(
      "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (activeStream.length > 0) {
      res.status(400).json({ error: "Cannot regenerate stream key while streaming" });
      return;
    }

    // Generate unique stream key
    let streamKey: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = crypto.randomBytes(24).toString("hex");

      // Check uniqueness in both stream_sources and users table
      const existingInSources = await db.query<any>(
        "SELECT id FROM stream_sources WHERE stream_key = $1 AND id != $2",
        [streamKey, id]
      );

      const existingInUsers = await db.query<any>(
        "SELECT id FROM users WHERE stream_key = $1",
        [streamKey]
      );

      if (existingInSources.length === 0 && existingInUsers.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      res.status(500).json({ error: "Failed to generate unique stream key" });
      return;
    }

    // Update the stream key
    const result = await db.run<any>(
      "UPDATE stream_sources SET stream_key = $1 WHERE id = $2 RETURNING *",
      [streamKey, id]
    );

    res.json({
      message: "Stream key regenerated successfully",
      source: result,
    });
  } catch (error: any) {
    console.error("Regenerate stream key error:", error);
    res.status(500).json({ error: "Failed to regenerate stream key" });
  }
});

// ============================================
// DESTINATIONS MANAGEMENT
// ============================================

// Get all destinations with source info
router.get("/destinations", async (req: Request, res: Response): Promise<void> => {
  try {
    const destinations = await db.query<any>(`
      SELECT
        sd.*,
        ss.name as source_name,
        u.email as user_email,
        u.display_name as user_display_name
      FROM source_destinations sd
      LEFT JOIN stream_sources ss ON sd.source_id = ss.id
      LEFT JOIN users u ON ss.user_id = u.id
      ORDER BY sd.created_at DESC
    `);

    res.json({ destinations });
  } catch (error: any) {
    console.error("Get destinations error:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// Get specific destination
router.get("/destinations/:id", handleGenericIdParam('source_destinations'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Destination is already available from middleware
    const destination = (req as any).entity;

    res.json({ destination });
  } catch (error: any) {
    console.error("Get destination error:", error);
    res.status(500).json({ error: "Failed to fetch destination" });
  }
});

// Update destination
router.put("/destinations/:id", handleGenericIdParam('source_destinations'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { platform, rtmp_url, stream_key, is_active } = req.body as {
    platform?: string;
    rtmp_url?: string;
    stream_key?: string;
    is_active?: boolean;
  };

  try {
    // Destination exists check is already handled by middleware
    const existingDest = (req as any).entity;

    // Update the destination
    const result = await db.run<any>(
      "UPDATE source_destinations SET platform = COALESCE($1, platform), rtmp_url = COALESCE($2, rtmp_url), stream_key = COALESCE($3, stream_key), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *",
      [platform, rtmp_url, stream_key, is_active, id]
    );

    res.json({ destination: result });
  } catch (error: any) {
    console.error("Update destination error:", error);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

// Delete destination
router.delete("/destinations/:id", handleGenericIdParam('source_destinations'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await db.run<any>(
      "DELETE FROM source_destinations WHERE id = $1",
      [id]
    );

    if (result.changes === 0) {
      res.status(404).json({ error: "Destination not found" });
      return;
    }

    res.json({ message: "Destination deleted successfully" });
  } catch (error: any) {
    console.error("Delete destination error:", error);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

// ============================================
// USER MANAGEMENT EXTENSIONS
// ============================================

// Suspend user
router.post("/users/:id/suspend", handleGenericIdParam('users'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // User exists check is already handled by middleware
    const user = (req as any).entity;

    // Check if user has active streams
    const activeStreams = await db.query<any>(
      "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      res.status(400).json({ error: "Cannot suspend user with active streams" });
      return;
    }

    // Deactivate all user's stream sources
    await db.run(
      "UPDATE stream_sources SET is_active = false WHERE user_id = $1",
      [id]
    );

    // Update user with suspended flag (using display_name to store suspension info)
    await db.run(
      "UPDATE users SET display_name = CASE WHEN display_name LIKE '[SUSPENDED]%' THEN display_name ELSE '[SUSPENDED] ' || COALESCE(display_name, email) END WHERE id = $1",
      [id]
    );

    res.json({ message: "User suspended successfully" });
  } catch (error: any) {
    console.error("Suspend user error:", error);
    res.status(500).json({ error: "Failed to suspend user" });
  }
});

// Unsuspend user
router.post("/users/:id/unsuspend", handleGenericIdParam('users'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // User exists check is already handled by middleware
    const user = (req as any).entity;

    // Remove suspension prefix from display_name
    await db.run(
      "UPDATE users SET display_name = CASE WHEN display_name LIKE '[SUSPENDED]%' THEN SUBSTRING(display_name, 12) ELSE display_name END WHERE id = $1",
      [id]
    );

    res.json({ message: "User unsuspended successfully" });
  } catch (error: any) {
    console.error("Unsuspend user error:", error);
    res.status(500).json({ error: "Failed to unsuspend user" });
  }
});

// Reset user stream key
router.post("/users/:id/reset-stream-key", handleGenericIdParam('users'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // User exists check is already handled by middleware
    const user = (req as any).entity;

    // Check if user has active streams
    const activeStreams = await db.query<any>(
      "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      res.status(400).json({
        error: "Cannot reset stream key while user has active streams",
      });
      return;
    }

    // Generate unique stream key
    let streamKey: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = crypto.randomBytes(24).toString("hex");

      const existingInSources = await db.query<any>(
        "SELECT id FROM stream_sources WHERE stream_key = $1",
        [streamKey]
      );

      const existingInUsers = await db.query<any>(
        "SELECT id FROM users WHERE stream_key = $1 AND id != $2",
        [streamKey, id]
      );

      if (existingInSources.length === 0 && existingInUsers.length === 0) {
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
});

// ============================================
// ANALYTICS AND REPORTS
// ============================================

// Get detailed user analytics
router.get("/analytics/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = "30d" } = req.query as any;
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (period === "7d") {
      periodFilter = "NOW() - INTERVAL '7 days'";
    } else if (period === "24h") {
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // User registration trends
    const registrationTrends = await db.query<any>(`
      SELECT
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as registrations,
        COUNT(CASE WHEN oauth_provider = 'google' THEN 1 END) as google_registrations,
        COUNT(CASE WHEN oauth_provider = 'twitch' THEN 1 END) as twitch_registrations,
        COUNT(CASE WHEN oauth_provider IS NULL THEN 1 END) as email_registrations
      FROM users
      WHERE created_at > ${periodFilter}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `);

    // User activity metrics
    const activityMetrics = await db.query<any>(`
      SELECT
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN as_.started_at > ${periodFilter} THEN u.id END) as active_users,
        COUNT(DISTINCT CASE WHEN as_.started_at > NOW() - INTERVAL '7 days' THEN u.id END) as active_users_7d,
        COUNT(DISTINCT CASE WHEN as_.started_at > NOW() - INTERVAL '24 hours' THEN u.id END) as active_users_24h
      FROM users u
      LEFT JOIN stream_sources ss ON u.id = ss.user_id
      LEFT JOIN active_streams as_ ON ss.id = as_.source_id
    `);

    // User retention metrics
    const retentionMetrics = await db.query<any>(`
      SELECT
        DATE_TRUNC('day', u.created_at) as cohort_date,
        COUNT(*) as cohort_size,
        COUNT(DISTINCT CASE WHEN as_.started_at > u.created_at + INTERVAL '1 day' THEN u.id END) as retained_day1,
        COUNT(DISTINCT CASE WHEN as_.started_at > u.created_at + INTERVAL '7 days' THEN u.id END) as retained_day7,
        COUNT(DISTINCT CASE WHEN as_.started_at > u.created_at + INTERVAL '30 days' THEN u.id END) as retained_day30
      FROM users u
      LEFT JOIN stream_sources ss ON u.id = ss.user_id
      LEFT JOIN active_streams as_ ON ss.id = as_.source_id
      WHERE u.created_at > ${periodFilter}
      GROUP BY DATE_TRUNC('day', u.created_at)
      ORDER BY cohort_date ASC
    `);

    res.json({
      registrationTrends,
      activityMetrics: activityMetrics[0],
      retentionMetrics,
    });
  } catch (error: any) {
    console.error("Get user analytics error:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

// Get detailed stream analytics
router.get("/analytics/streams", async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = "30d" } = req.query as any;
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (period === "7d") {
      periodFilter = "NOW() - INTERVAL '7 days'";
    } else if (period === "24h") {
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // Stream activity trends
    const streamTrends = await db.query<any>(`
      SELECT
        DATE_TRUNC('day', started_at) as date,
        COUNT(*) as streams_started,
        COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as streams_completed,
        AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at))) as avg_duration_seconds,
        COUNT(DISTINCT user_id) as unique_streamers
      FROM active_streams
      WHERE started_at > ${periodFilter}
      GROUP BY DATE_TRUNC('day', started_at)
      ORDER BY date ASC
    `);

    // Platform usage analytics
    const platformAnalytics = await db.query<any>(`
      SELECT
        sd.platform,
        COUNT(*) as total_destinations,
        COUNT(CASE WHEN sd.is_active = true THEN 1 END) as active_destinations,
        COUNT(DISTINCT sd.source_id) as unique_sources,
        COUNT(DISTINCT ss.user_id) as unique_users
      FROM source_destinations sd
      LEFT JOIN stream_sources ss ON sd.source_id = ss.id
      GROUP BY sd.platform
      ORDER BY total_destinations DESC
    `);

    // Streaming quality metrics
    const qualityMetrics = await db.query<any>(`
      SELECT
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) < 60 THEN 1 END) as under_1min,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) BETWEEN 60 AND 300 THEN 1 END) as between_1_5min,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) BETWEEN 300 AND 1800 THEN 1 END) as between_5_30min,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (ended_at - started_at)) > 1800 THEN 1 END) as over_30min,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration_seconds
      FROM active_streams
      WHERE started_at > ${periodFilter} AND ended_at IS NOT NULL
    `);

    res.json({
      streamTrends,
      platformAnalytics,
      qualityMetrics: qualityMetrics[0],
    });
  } catch (error: any) {
    console.error("Get stream analytics error:", error);
    res.status(500).json({ error: "Failed to fetch stream analytics" });
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

// Get all subscription plans
router.get("/subscription-plans", async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await db.query<any>(
      `SELECT
         sp.*,
         COUNT(us.id) as active_subscriptions
       FROM subscription_plans sp
       LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
       GROUP BY sp.id
       ORDER BY sp.price_monthly ASC`
    );

    res.json(plans);
  } catch (error: any) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
});

// Create new subscription plan
router.post("/subscription-plans", async (req: Request, res: Response): Promise<void> => {
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
    features
  } = req.body as any;

  try {
    const result = await db.run<any>(
      `INSERT INTO subscription_plans (
        name, description, price_monthly, price_yearly, price_monthly_inr, price_yearly_inr,
        max_sources, max_destinations, max_streaming_hours_monthly, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        name,
        description,
        price_monthly,
        price_yearly,
        price_monthly_inr,
        price_yearly_inr,
        max_sources,
        max_destinations,
        max_streaming_hours_monthly,
        JSON.stringify(features || [])
      ]
    );

    res.json(result);
  } catch (error: any) {
    console.error("Create subscription plan error:", error);
    res.status(500).json({ error: "Failed to create subscription plan" });
  }
});

// Update subscription plan
router.put("/subscription-plans/:id", handleGenericIdParam('subscription_plans'), async (req: Request, res: Response): Promise<void> => {
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
    features
  } = (req.body as any).planData || req.body; // Handle both nested and direct data

  try {
    // Plan exists check is already handled by middleware
    const plan = (req as any).entity;

    const result = await db.run<any>(
      `UPDATE subscription_plans SET
        name = $1,
        description = $2,
        price_monthly = $3,
        price_yearly = $4,
        price_monthly_inr = $5,
        price_yearly_inr = $6,
        max_sources = $7,
        max_destinations = $8,
        max_streaming_hours_monthly = $9,
        features = $10
      WHERE id = $11 RETURNING *`,
      [
        name,
        description,
        price_monthly,
        price_yearly,
        price_monthly_inr,
        price_yearly_inr,
        max_sources,
        max_destinations,
        max_streaming_hours_monthly,
        JSON.stringify(features || []),
        plan.id
      ]
    );

    if (!result || (result.changes === 0 && !result.id)) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    res.json(result);
  } catch (error: any) {
    console.error("Update subscription plan error:", {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      params: req.params
    });
    res.status(500).json({
      error: "Failed to update subscription plan",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete subscription plan
router.delete("/subscription-plans/:id", handleGenericIdParam('subscription_plans'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Plan exists check is already handled by middleware
    const plan = (req as any).entity;

    // Check if plan has active subscriptions
    const activeSubscriptions = await db.query<any>(
      "SELECT COUNT(*) as count FROM user_subscriptions WHERE plan_id = $1 AND status = 'active'",
      [plan.id]
    );

    if (parseInt(activeSubscriptions[0].count) > 0) {
      res.status(400).json({
        error: "Cannot delete plan with active subscriptions. Please migrate users to other plans first."
      });
      return;
    }

    const result = await db.run<any>(
      "DELETE FROM subscription_plans WHERE id = $1 RETURNING *",
      [plan.id]
    );

    if (result.length === 0) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    res.json({ message: "Subscription plan deleted successfully" });
  } catch (error: any) {
    console.error("Delete subscription plan error:", error);
    res.status(500).json({ error: "Failed to delete subscription plan" });
  }
});

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
      [`%${search}%`, limit, offset]
    );

    // Get total count for pagination
    const totalCount = await db.query<any>(
      `SELECT COUNT(*) as count
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE u.email ILIKE $1 OR u.display_name ILIKE $1 OR sp.name ILIKE $1`,
      [`%${search}%`]
    );

    res.json({
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount[0].count),
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error: any) {
    console.error("Get user subscriptions error:", error);
    res.status(500).json({ error: "Failed to fetch user subscriptions" });
  }
});

// Update user subscription
router.put("/user-subscriptions/:userId", handleUserIdParam, async (req: Request, res: Response): Promise<void> => {
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
      [plan_id]
    );

    if (planCheck.length === 0) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    // Update or create subscription
    const existingSubscription = await db.query<any>(
      "SELECT id FROM user_subscriptions WHERE user_id = $1",
      [targetUser.id]
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
        [plan_id, status, current_period_end, targetUser.id]
      );
    } else {
      // Create new subscription
      result = await db.run<any>(
        `INSERT INTO user_subscriptions (
          user_id, plan_id, status, current_period_start, current_period_end
        ) VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
        [targetUser.id, plan_id, status, current_period_end]
      );
    }

    res.json(result[0]);
  } catch (error: any) {
    console.error("Update user subscription error:", error);
    res.status(500).json({ error: "Failed to update user subscription" });
  }
});

// Get subscription analytics
router.get("/subscription-analytics", async (req: Request, res: Response): Promise<void> => {
  try {
    // Plan distribution
    const planDistribution = await db.query<any>(
      `SELECT
         sp.name,
         COUNT(us.id) as user_count,
         COUNT(us.id) * 100.0 / (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as percentage
       FROM subscription_plans sp
       LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
       GROUP BY sp.id, sp.name
       ORDER BY user_count DESC`
    );

    // Monthly revenue projection
    const revenueProjection = await db.query<any>(
      `SELECT
         sp.name,
         COUNT(us.id) as active_users,
         SUM(sp.price_monthly) as monthly_revenue
       FROM subscription_plans sp
       JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
       GROUP BY sp.id, sp.name
       ORDER BY monthly_revenue DESC`
    );

    // Subscription growth over time
    const growthData = await db.query<any>(
      `SELECT
         DATE_TRUNC('month', created_at) as month,
         COUNT(*) as new_subscriptions,
         SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as total_subscriptions
       FROM user_subscriptions
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC
       LIMIT 12`
    );

    res.json({
      planDistribution,
      revenueProjection,
      growthData
    });
  } catch (error: any) {
    console.error("Get subscription analytics error:", error);
    res.status(500).json({ error: "Failed to fetch subscription analytics" });
  }
});

// Get user's currency preference
router.get("/settings/currency", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const preference = await currencyService.getUserCurrencyPreference(userId);
    const currencyInfo = currencyService.getCurrencyInfo(preference);

    res.json({
      success: true,
      data: {
        preference,
        currency: currencyInfo
      }
    });
  } catch (error: any) {
    console.error("Get currency preference error:", error);
    res.status(500).json({ error: "Failed to fetch currency preference" });
  }
});

// Update user's currency preference
router.post("/settings/currency", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { currency_preference } = req.body as { currency_preference: string };

    if (!['AUTO', 'USD', 'INR'].includes(currency_preference)) {
      res.status(400).json({
        error: "Invalid currency preference. Must be AUTO, USD, or INR"
      });
      return;
    }

    const updatedPreference = await currencyService.setUserCurrencyPreference(
      userId,
      currency_preference
    );

    res.json({
      success: true,
      data: {
        preference: updatedPreference,
        message: "Currency preference updated successfully"
      }
    });
  } catch (error: any) {
    console.error("Update currency preference error:", error);
    res.status(500).json({ error: "Failed to update currency preference" });
  }
});

// Get current currency context (for debugging/admin info)
router.get("/currency/context", authenticateToken, detectCurrency, async (req: Request, res: Response): Promise<void> => {
  try {
    const currencyContext = getCurrencyContext(req);

    res.json({
      success: true,
      data: currencyContext
    });
  } catch (error: any) {
    console.error("Get currency context error:", error);
    res.status(500).json({ error: "Failed to fetch currency context" });
  }
});

// Update exchange rate (admin only)
router.post("/currency/exchange-rate", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rate, from_currency = 'USD', to_currency = 'INR' } = req.body as {
      rate: number;
      from_currency?: string;
      to_currency?: string;
    };

    if (!rate || rate <= 0) {
      res.status(400).json({
        error: "Invalid exchange rate"
      });
      return;
    }

    await currencyService.updateExchangeRate(rate, from_currency, to_currency);

    res.json({
      success: true,
      data: {
        rate,
        from_currency,
        to_currency,
        message: "Exchange rate updated successfully"
      }
    });
  } catch (error: any) {
    console.error("Update exchange rate error:", error);
    res.status(500).json({ error: "Failed to update exchange rate" });
  }
});

export default router;
