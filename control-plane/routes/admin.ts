import express, { Request, Response } from "express";
import Database from "../lib/database";
import { authenticateToken } from "../middleware/auth";
import currencyService from "../services/currencyService";
import { detectCurrency, getCurrencyContext } from "../middleware/currencyMiddleware";
import { handleUserIdParam, handleGenericIdParam } from "../middleware/idHandler";
import * as crypto from "crypto";
import mediamtxService from "../services/mediamtxService";

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
    const isUuid = (req as any).isUuid || false;
    const userParam = isUuid ? user.uuid : user.id;

    // Get user's stream sources
    // FIXED: Use conditional query instead of string interpolation
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
      WHERE ${isUuid ? 'ss.user_uuid = $1' : 'ss.user_id = $1'}
      GROUP BY ss.id
      ORDER BY ss.created_at DESC
    `,
      [userParam]
    );

    // Get user's active streams
    // FIXED: Use config->>'name' instead of non-existent ss.name column
    const activeStreams = await db.query<any>(
      `
      SELECT
        as_.*,
        ss.config->>'name' as source_name
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      WHERE ${isUuid ? 'as_.user_uuid = $1' : 'as_.user_id = $1'} AND as_.ended_at IS NULL
      ORDER BY as_.started_at DESC
    `,
      [userParam]
    );

    // Get stream statistics
    const streamStats = await db.query<any>(
      `
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE ${isUuid ? 'user_uuid = $1' : 'user_id = $1'} AND ended_at IS NOT NULL
    `,
      [userParam]
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

    // FIXED: Get destination statistics from correct table (destinations)
    const destStats = await db.query<any>(`
      SELECT
        COUNT(*) as total_destinations,
        COUNT(CASE WHEN d.platform = 'youtube' THEN 1 END) as youtube_dests,
        COUNT(CASE WHEN d.platform = 'twitch' THEN 1 END) as twitch_dests,
        COUNT(CASE WHEN d.platform = 'facebook' THEN 1 END) as facebook_dests
      FROM source_destinations sd
      JOIN destinations d ON sd.destination_id = d.id
      WHERE sd.is_active = true
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

    // FIXED: Whitelist interval values to prevent SQL injection
    const validIntervals = ['hour', 'day', 'week', 'month'];
    const validPeriods = ['24h', '7d', '30d'];

    let interval = "day";
    let periodFilter = "NOW() - INTERVAL '7 days'";

    if (period === "30d") {
      periodFilter = "NOW() - INTERVAL '30 days'";
    } else if (period === "24h") {
      interval = "hour";
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // Validate interval
    if (!validIntervals.includes(interval)) {
      interval = "day";
    }

    // Get user registration trends
    const userTrends = await db.query<any>(`
      SELECT
        DATE_TRUNC($1, created_at) as period,
        COUNT(*) as users
      FROM users
      WHERE created_at > ${periodFilter}
      GROUP BY DATE_TRUNC($1, created_at)
      ORDER BY period ASC
    `, [interval]);

    // Get stream activity trends
    const streamTrends = await db.query<any>(`
      SELECT
        DATE_TRUNC($1, started_at) as period,
        COUNT(*) as streams_started,
        COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as streams_completed
      FROM active_streams
      WHERE started_at > ${periodFilter}
      GROUP BY DATE_TRUNC($1, started_at)
      ORDER BY period ASC
    `, [interval]);

    // FIXED: Get platform distribution from correct table
    const platformDistribution = await db.query<any>(`
      SELECT
        d.platform,
        COUNT(*) as count
      FROM source_destinations sd
      JOIN destinations d ON sd.destination_id = d.id
      WHERE sd.is_active = true
      GROUP BY d.platform
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

    // FIXED: Get destinations for this source from correct table
    const destinations = await db.query<any>(
      `
      SELECT sd.*, d.* FROM source_destinations sd
      JOIN destinations d ON sd.destination_id = d.id
      WHERE sd.source_id = $1
      ORDER BY sd.created_at DESC
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

    // FIXED: Use config JSONB to store name and description
    const result = await db.run<any>(
      `UPDATE stream_sources SET
        config = jsonb_set(
          COALESCE(config, '{}'::jsonb),
          '{name}',
          CASE WHEN $1 IS NULL THEN config->>'name' ELSE $1::text END
        ),
        config = jsonb_set(
          COALESCE(config, '{}'::jsonb),
          '{description}',
          CASE WHEN $2 IS NULL THEN config->>'description' ELSE $2::text END
        ),
        is_active = COALESCE($3, is_active)
      WHERE id = $4 RETURNING *`,
      [name, description, is_active, id]
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
    let streamKey: string = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = crypto.randomBytes(24).toString("hex");

      // FIXED: Check uniqueness in destinations table (not stream_sources)
      const existingInDestinations = await db.query<any>(
        "SELECT id FROM destinations WHERE stream_key = $1",
        [streamKey]
      );

      const existingInUsers = await db.query<any>(
        "SELECT id FROM users WHERE stream_key = $1",
        [streamKey]
      );

      if (existingInDestinations.length === 0 && existingInUsers.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      res.status(500).json({ error: "Failed to generate unique stream key" });
      return;
    }

    // FIXED: Update user stream key (not stream_sources)
    const userId = existingSource.user_id;
    const result = await db.run<any>(
      "UPDATE users SET stream_key = $1 WHERE id = $2 RETURNING *",
      [streamKey, userId]
    );

    res.json({
      message: "Stream key regenerated successfully",
      user: result,
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
    // FIXED: Query destinations table, not source_destinations
    const destinations = await db.query<any>(`
      SELECT
        d.*,
        ss.uuid as source_uuid,
        ss.config->>'name' as source_name,
        u.email as user_email,
        u.display_name as user_display_name
      FROM destinations d
      JOIN source_destinations sd ON d.id = sd.destination_id
      JOIN stream_sources ss ON sd.source_id = ss.id
      JOIN users u ON ss.user_id = u.id
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

    // FIXED: Update destinations table, not source_destinations
    const result = await db.run<any>(
      `UPDATE destinations d
       JOIN source_destinations sd ON d.id = sd.destination_id
       SET d.platform = COALESCE($1, d.platform),
           d.rtmp_url = COALESCE($2, d.rtmp_url),
           d.stream_key = COALESCE($3, d.stream_key),
           sd.is_active = COALESCE($4, sd.is_active)
       WHERE sd.id = $5
       RETURNING d.*, sd.id as source_destinations_id, sd.is_active`,
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
    let streamKey: string = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = crypto.randomBytes(24).toString("hex");

      // FIXED: Only check destinations and users tables
      const existingInDestinations = await db.query<any>(
        "SELECT id FROM destinations WHERE stream_key = $1",
        [streamKey]
      );

      const existingInUsers = await db.query<any>(
        "SELECT id FROM users WHERE stream_key = $1 AND id != $2",
        [streamKey, id]
      );

      if (existingInDestinations.length === 0 && existingInUsers.length === 0) {
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

    // FIXED: Whitelist period values
    const validPeriods = ['24h', '7d', '30d'];
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (validPeriods.includes(period)) {
      periodFilter = period === '24h' ? "NOW() - INTERVAL '24 hours'"
        : period === '7d' ? "NOW() - INTERVAL '7 days'"
        : "NOW() - INTERVAL '30 days'";
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

    // FIXED: Whitelist period values
    const validPeriods = ['24h', '7d', '30d'];
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (validPeriods.includes(period)) {
      periodFilter = period === '24h' ? "NOW() - INTERVAL '24 hours'"
        : period === '7d' ? "NOW() - INTERVAL '7 days'"
        : "NOW() - INTERVAL '30 days'";
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

    // FIXED: Platform usage analytics from correct table
    const platformAnalytics = await db.query<any>(`
      SELECT
        d.platform,
        COUNT(*) as total_destinations,
        COUNT(CASE WHEN sd.is_active = true THEN 1 END) as active_destinations,
        COUNT(DISTINCT sd.source_id) as unique_sources,
        COUNT(DISTINCT ss.user_id) as unique_users
      FROM source_destinations sd
      JOIN destinations d ON sd.destination_id = d.id
      LEFT JOIN stream_sources ss ON sd.source_id = ss.id
      GROUP BY d.platform
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
    // FIXED: Use limits JSONB instead of individual columns
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
        'USD',
        JSON.stringify(features || []),
        JSON.stringify({
          price_monthly_inr,
          price_yearly_inr,
          max_sources,
          max_destinations,
          max_streaming_hours_monthly
        })
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

    // FIXED: Use limits JSONB
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
          max_streaming_hours_monthly
        }),
        plan.id
      ]
    );

    // FIXED: Proper return value check for db.run()
    if (result.changes === 0) {
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

    // FIXED: db.run() returns {changes}, not array
    if (result.changes === 0) {
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
// Promote/Demote user subscription with audit logging
router.put("/user-subscriptions/:userId/promote-demote", handleUserIdParam, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { plan_id, reason, effective_date = 'immediate' } = req.body as {
    plan_id: number;
    reason: string;
    effective_date?: 'immediate' | 'next_billing';
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
      [targetUser.id]
    );

    if (currentSubscription.length === 0) {
      res.status(404).json({ error: "No active subscription found" });
      return;
    }

    const currentPlan = currentSubscription[0];

    // Check if new plan exists
    const newPlan = await db.query<any>(
      "SELECT * FROM subscription_plans WHERE id = $1",
      [plan_id]
    );

    if (newPlan.length === 0) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    const newPlanData = newPlan[0];

    // Determine if promotion or demotion
    const isPromotion = newPlanData.price_monthly > currentPlan.price_monthly;
    const changeType = isPromotion ? 'promotion' : 'demotion';

    // Update subscription
    const result = await db.run<any>(
      `UPDATE user_subscriptions SET
        plan_id = $1,
        updated_at = NOW()
      WHERE user_id = $2 AND status = 'active' RETURNING *`,
      [plan_id, targetUser.id]
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
        adminId
      ]
    );

    res.json({
      success: true,
      message: `User ${changeType}d from ${currentPlan.plan_name} to ${newPlanData.name}`,
      subscription: result,
      change_type: changeType,
      previous_plan: currentPlan.plan_name,
      new_plan: newPlanData.name
    });
  } catch (error: any) {
    console.error("Promote/demote subscription error:", error);
    res.status(500).json({ error: "Failed to update user subscription" });
  }
});

// Standard subscription update (existing endpoint, enhanced)
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

// ============================================
// LIMIT OVERRIDES MANAGEMENT
// ============================================

// Get all active limit overrides
router.get("/limit-overrides", async (req: Request, res: Response): Promise<void> => {
  try {
    const overrides = await (subscriptionService as any).getAllLimitOverrides();
    res.json({ overrides });
  } catch (error: any) {
    console.error("Get limit overrides error:", error);
    res.status(500).json({ error: "Failed to fetch limit overrides" });
  }
});

// Get limit overrides for a specific user
router.get("/users/:id/limits/overrides", handleUserIdParam, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const targetUser = (req as any).targetUser;
    const overrides = await (subscriptionService as any).getUserLimitOverrides(targetUser.id);
    res.json({ overrides });
  } catch (error: any) {
    console.error("Get user limit overrides error:", error);
    res.status(500).json({ error: "Failed to fetch user limit overrides" });
  }
});

// Set a limit override for a user
router.post("/users/:id/limits/override", handleUserIdParam, async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ error: "Missing required fields: limit_type, value, reason" });
      return;
    }

    // Call subscription service
    await (subscriptionService as any).setUserLimitOverride(
      targetUser.id,
      limit_type,
      value,
      reason,
      adminId,
      expires_at ? new Date(expires_at) : undefined
    );

    res.json({
      success: true,
      message: `Limit override set for ${targetUser.email}`,
      limit_type,
      value
    });
  } catch (error: any) {
    console.error("Set limit override error:", error);
    res.status(500).json({ error: "Failed to set limit override: " + error.message });
  }
});

// Remove a limit override for a user
router.delete("/users/:id/limits/override/:limitType", handleUserIdParam, async (req: Request, res: Response): Promise<void> => {
  const { id, limitType } = req.params;

  try {
    const targetUser = (req as any).targetUser;

    await (subscriptionService as any).removeUserLimitOverride(targetUser.id, limitType);

    res.json({
      success: true,
      message: `Limit override removed for ${targetUser.email}`,
      limit_type: limitType
    });
  } catch (error: any) {
    console.error("Remove limit override error:", error);
    res.status(500).json({ error: "Failed to remove limit override" });
  }
});

// ============================================
// STREAM PREVIEW & CONTROL
// ============================================

// Get active streams with enhanced details
router.get("/streams/active", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get streams from MediaMTX
    const activePaths = await mediamtxService.getActivePaths();

    // Enhance with user data from database
    const enhancedStreams = await Promise.all(
      activePaths.map(async (path) => {
        // Look up user by stream key
        const userResult = await db.query<any>(
          `SELECT u.id, u.email, u.display_name
           FROM users u
           WHERE u.stream_key = $1`,
          [path.name]
        );

        // Also check active_streams table for additional info
        const streamInfo = await db.query<any>(
          `SELECT as_.*
           FROM active_streams as_
           WHERE as_.stream_key = $1 AND as_.ended_at IS NULL`,
          [path.name]
        );

        return {
          stream_key: path.name,
          user_email: userResult[0]?.email || 'Unknown',
          user_display_name: userResult[0]?.display_name,
          user_id: userResult[0]?.id,
          publisher_id: path.publisher?.id,
          started_at: path.publisher?.created,
          bytes_received: path.publisher?.bytesReceived || 0,
          packets_received: path.publisher?.packetsReceived || 0,
          stream_info: streamInfo[0] || null
        };
      })
    );

    res.json({
      streams: enhancedStreams,
      total: enhancedStreams.length
    });
  } catch (error: any) {
    console.error("Get active streams error:", error);
    res.status(500).json({ error: "Failed to fetch active streams" });
  }
});

// Get stream preview information
router.get("/streams/:streamKey/preview", async (req: Request, res: Response): Promise<void>=> {
  const { streamKey } = req.params;

  try {
    // Get stream details from MediaMTX
    const path = await mediamtxService.getPathDetails(streamKey);

    if (!path) {
      res.status(404).json({ error: "Stream not found" });
      return;
    }

    // Generate HLS URL for preview
    const mediaServerHost = process.env.MEDIA_SERVER_HOST || 'localhost';
    const hlsPort = process.env.HLS_PORT || '8888';
    const previewUrl = `http://${mediaServerHost}:${hlsPort}/hls/${streamKey}.m3u8`;

    // Get stream metrics
    const metrics = await mediamtxService.getStreamMetrics(streamKey);

    // Get user info
    const userResult = await db.query<any>(
      `SELECT u.id, u.email, u.display_name
       FROM users u
       WHERE u.stream_key = $1`,
      [streamKey]
    );

    res.json({
      streamKey,
      previewUrl,
      isActive: !!path.publisher,
      user: userResult[0] || null,
      metrics,
      startedAt: path.publisher?.created,
      publisherId: path.publisher?.id
    });
  } catch (error: any) {
    console.error("Get stream preview error:", error);
    res.status(500).json({ error: "Failed to get stream preview" });
  }
});

// Stop a stream
router.post("/streams/:streamKey/stop", async (req: Request, res: Response): Promise<void> => {
  const { streamKey } = req.params;
  const { reason } = req.body as { reason?: string };
  const adminId = (req as any).user.id;

  try {
    // Get stream info before stopping
    const streamInfo = await db.query<any>(
      `SELECT as_.*, u.email
       FROM active_streams as_
       JOIN users u ON as_.user_id = u.id
       WHERE as_.stream_key = $1 AND as_.ended_at IS NULL`,
      [streamKey]
    );

    // Stop the stream via MediaMTX API
    const stopResult = await mediamtxService.stopStream(streamKey);

    if (stopResult.success) {
      // Log the action
      await db.run(
        `INSERT INTO stream_control_logs (
          stream_key, action, reason, admin_id, created_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [streamKey, 'stopped_by_admin', reason || 'No reason provided', adminId]
      );

      res.json({
        success: true,
        message: stopResult.message,
        stream_key: streamKey,
        user_email: streamInfo[0]?.email
      });
    } else {
      res.status(500).json({
        success: false,
        error: stopResult.message
      });
    }
  } catch (error: any) {
    console.error("Stop stream error:", error);
    res.status(500).json({ error: "Failed to stop stream" });
  }
});

// Get stream control logs
router.get("/streams/control-logs", async (req: Request, res: Response): Promise<void> {
  const { limit = 50 } = req.query;

  try {
    const logs = await db.query<any>(
      `SELECT scl.*, u.email as admin_email
       FROM stream_control_logs scl
       JOIN users u ON scl.admin_id = u.id
       ORDER BY scl.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ logs });
  } catch (error: any) {
    console.error("Get stream control logs error:", error);
    res.status(500).json({ error: "Failed to fetch stream control logs" });
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
    const growthData = await db.query<any>(`
      SELECT
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
    const effectiveCurrency = await currencyService.determineEffectiveCurrency(userId, null);
    const currencyInfo = currencyService.getCurrencyInfo(effectiveCurrency);

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
      currency_preference as any
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

    await currencyService.updateExchangeRate(rate, from_currency as any, to_currency as any);

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
