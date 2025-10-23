const express = require("express");
const Database = require("../lib/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const db = new Database();

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.email !== "admin@neustream.app") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateToken, requireAdmin);

// Get all users with their streaming info
router.get("/users", async (req, res) => {
  try {
    const users = await db.query(`
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
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get specific user details with their sources and streams
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get user basic info
    const users = await db.query(
      `
      SELECT id, email, display_name, avatar_url, oauth_provider, stream_key, created_at
      FROM users WHERE id = $1
    `,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Get user's stream sources
    const sources = await db.query(
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
      WHERE ss.user_id = $1
      GROUP BY ss.id
      ORDER BY ss.created_at DESC
    `,
      [id]
    );

    // Get user's active streams
    const activeStreams = await db.query(
      `
      SELECT
        as_.*,
        ss.name as source_name
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      WHERE as_.user_id = $1 AND as_.ended_at IS NULL
      ORDER BY as_.started_at DESC
    `,
      [id]
    );

    // Get stream statistics
    const streamStats = await db.query(
      `
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE user_id = $1 AND ended_at IS NOT NULL
    `,
      [id]
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
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Get system statistics
router.get("/stats", async (req, res) => {
  try {
    // Get user statistics
    const userStats = await db.query(`
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
    const streamStats = await db.query(`
      SELECT
        COUNT(*) as total_sources,
        COUNT(CASE WHEN ss.is_active = true THEN 1 END) as active_sources,
        COUNT(CASE WHEN ss.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_sources_week
      FROM stream_sources ss
    `);

    // Get active streams
    const activeStreamsCount = await db.query(`
      SELECT COUNT(*) as active_streams
      FROM active_streams
      WHERE ended_at IS NULL
    `);

    // Get destination statistics
    const destStats = await db.query(`
      SELECT
        COUNT(*) as total_destinations,
        COUNT(CASE WHEN platform = 'youtube' THEN 1 END) as youtube_dests,
        COUNT(CASE WHEN platform = 'twitch' THEN 1 END) as twitch_dests,
        COUNT(CASE WHEN platform = 'facebook' THEN 1 END) as facebook_dests
      FROM source_destinations
      WHERE is_active = true
    `);

    // Get recent activity (last 24 hours)
    const recentActivity = await db.query(`
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
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch system statistics" });
  }
});

// Get analytics data for charts
router.get("/analytics", async (req, res) => {
  try {
    const { period = "7d" } = req.query;

    let interval = "day";
    let periodFilter = "NOW() - INTERVAL '7 days'";

    if (period === "30d") {
      periodFilter = "NOW() - INTERVAL '30 days'";
    } else if (period === "24h") {
      interval = "hour";
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // Get user registration trends
    const userTrends = await db.query(`
      SELECT
        DATE_TRUNC('${interval}', created_at) as period,
        COUNT(*) as users
      FROM users
      WHERE created_at > ${periodFilter}
      GROUP BY DATE_TRUNC('${interval}', created_at)
      ORDER BY period ASC
    `);

    // Get stream activity trends
    const streamTrends = await db.query(`
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
    const platformDistribution = await db.query(`
      SELECT
        platform,
        COUNT(*) as count
      FROM source_destinations
      WHERE is_active = true
      GROUP BY platform
      ORDER BY count DESC
    `);

    // Get OAuth provider distribution
    const oauthDistribution = await db.query(`
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
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// Update user (basic info)
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { displayName, isActive } = req.body;

  try {
    // Check if user exists
    const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);
    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user (limited fields for admin)
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (displayName !== undefined) {
      updates.push(`display_name = $${paramIndex++}`);
      params.push(displayName);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    params.push(id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(
        ", "
      )} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    res.json({ user: result[0] });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (with cascading deletes)
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userCheck = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has active streams
    const activeStreams = await db.query(
      "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete user with active streams" });
    }

    // Delete user (cascades to sources, destinations, etc.)
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({
      message: "User deleted successfully",
      userEmail: userCheck[0].email,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get system health
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbTest = await db.query("SELECT 1 as test");

    // Check recent stream activity
    const recentActivity = await db.query(`
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
  } catch (error) {
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
router.get("/sources", async (req, res) => {
  try {
    const sources = await db.query(`
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
  } catch (error) {
    console.error("Get sources error:", error);
    res.status(500).json({ error: "Failed to fetch stream sources" });
  }
});

// Get specific stream source with destinations
router.get("/sources/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the stream source
    const sources = await db.query(
      `
      SELECT ss.*, u.email, u.display_name
      FROM stream_sources ss
      LEFT JOIN users u ON ss.user_id = u.id
      WHERE ss.id = $1
    `,
      [id]
    );

    if (sources.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    const source = sources[0];

    // Get destinations for this source
    const destinations = await db.query(
      `
      SELECT * FROM source_destinations
      WHERE source_id = $1
      ORDER BY created_at DESC
    `,
      [id]
    );

    // Check if currently active
    const activeStream = await db.query(
      `
      SELECT * FROM active_streams
      WHERE source_id = $1 AND ended_at IS NULL
      ORDER BY started_at DESC LIMIT 1
    `,
      [id]
    );

    // Get stream statistics
    const streamStats = await db.query(
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
  } catch (error) {
    console.error("Get source error:", error);
    res.status(500).json({ error: "Failed to fetch stream source" });
  }
});

// Update stream source
router.put("/sources/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;

  try {
    // Check if source exists
    const existingSource = await db.query(
      "SELECT * FROM stream_sources WHERE id = $1",
      [id]
    );
    if (existingSource.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    // Check if source is currently active before deactivating
    if (is_active === false) {
      const activeStream = await db.query(
        "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
        [id]
      );

      if (activeStream.length > 0) {
        return res
          .status(400)
          .json({ error: "Cannot deactivate source while streaming" });
      }
    }

    // Update the source
    const result = await db.run(
      "UPDATE stream_sources SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *",
      [name?.trim(), description?.trim(), is_active, id]
    );

    res.json({ source: result });
  } catch (error) {
    console.error("Update source error:", error);
    res.status(500).json({ error: "Failed to update stream source" });
  }
});

// Delete stream source
router.delete("/sources/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if source exists
    const existingSource = await db.query(
      "SELECT * FROM stream_sources WHERE id = $1",
      [id]
    );
    if (existingSource.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    // Check if source is currently active
    const activeStream = await db.query(
      "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (activeStream.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete source while streaming" });
    }

    // Delete the source (destinations will be deleted due to CASCADE)
    const result = await db.run("DELETE FROM stream_sources WHERE id = $1", [
      id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    res.json({ message: "Stream source deleted successfully" });
  } catch (error) {
    console.error("Delete source error:", error);
    res.status(500).json({ error: "Failed to delete stream source" });
  }
});

// Regenerate stream key for source
router.post("/sources/:id/regenerate-key", async (req, res) => {
  const { id } = req.params;
  const crypto = require("crypto");

  try {
    // Check if source exists
    const existingSource = await db.query(
      "SELECT * FROM stream_sources WHERE id = $1",
      [id]
    );
    if (existingSource.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    // Check if source is currently active
    const activeStream = await db.query(
      "SELECT id FROM active_streams WHERE source_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (activeStream.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot regenerate stream key while streaming" });
    }

    // Generate unique stream key
    let streamKey;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = crypto.randomBytes(24).toString("hex");

      // Check uniqueness in both stream_sources and users table
      const existingInSources = await db.query(
        "SELECT id FROM stream_sources WHERE stream_key = $1 AND id != $2",
        [streamKey, id]
      );

      const existingInUsers = await db.query(
        "SELECT id FROM users WHERE stream_key = $1",
        [streamKey]
      );

      if (existingInSources.length === 0 && existingInUsers.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res
        .status(500)
        .json({ error: "Failed to generate unique stream key" });
    }

    // Update the stream key
    const result = await db.run(
      "UPDATE stream_sources SET stream_key = $1 WHERE id = $2 RETURNING *",
      [streamKey, id]
    );

    res.json({
      message: "Stream key regenerated successfully",
      source: result,
    });
  } catch (error) {
    console.error("Regenerate stream key error:", error);
    res.status(500).json({ error: "Failed to regenerate stream key" });
  }
});

// ============================================
// DESTINATIONS MANAGEMENT
// ============================================

// Get all destinations with source info
router.get("/destinations", async (req, res) => {
  try {
    const destinations = await db.query(`
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
  } catch (error) {
    console.error("Get destinations error:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// Get specific destination
router.get("/destinations/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const destinations = await db.query(
      `
      SELECT
        sd.*,
        ss.name as source_name,
        u.email as user_email,
        u.display_name as user_display_name
      FROM source_destinations sd
      LEFT JOIN stream_sources ss ON sd.source_id = ss.id
      LEFT JOIN users u ON ss.user_id = u.id
      WHERE sd.id = $1
    `,
      [id]
    );

    if (destinations.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json({ destination: destinations[0] });
  } catch (error) {
    console.error("Get destination error:", error);
    res.status(500).json({ error: "Failed to fetch destination" });
  }
});

// Update destination
router.put("/destinations/:id", async (req, res) => {
  const { id } = req.params;
  const { platform, rtmp_url, stream_key, is_active } = req.body;

  try {
    // Check if destination exists
    const existingDest = await db.query(
      "SELECT * FROM source_destinations WHERE id = $1",
      [id]
    );
    if (existingDest.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    // Update the destination
    const result = await db.run(
      "UPDATE source_destinations SET platform = COALESCE($1, platform), rtmp_url = COALESCE($2, rtmp_url), stream_key = COALESCE($3, stream_key), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *",
      [platform, rtmp_url, stream_key, is_active, id]
    );

    res.json({ destination: result });
  } catch (error) {
    console.error("Update destination error:", error);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

// Delete destination
router.delete("/destinations/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.run(
      "DELETE FROM source_destinations WHERE id = $1",
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Delete destination error:", error);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

// ============================================
// USER MANAGEMENT EXTENSIONS
// ============================================

// Suspend user
router.post("/users/:id/suspend", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userCheck = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has active streams
    const activeStreams = await db.query(
      "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      return res
        .status(400)
        .json({ error: "Cannot suspend user with active streams" });
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
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({ error: "Failed to suspend user" });
  }
});

// Unsuspend user
router.post("/users/:id/unsuspend", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userCheck = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove suspension prefix from display_name
    await db.run(
      "UPDATE users SET display_name = CASE WHEN display_name LIKE '[SUSPENDED]%' THEN SUBSTRING(display_name, 12) ELSE display_name END WHERE id = $1",
      [id]
    );

    res.json({ message: "User unsuspended successfully" });
  } catch (error) {
    console.error("Unsuspend user error:", error);
    res.status(500).json({ error: "Failed to unsuspend user" });
  }
});

// Reset user stream key
router.post("/users/:id/reset-stream-key", async (req, res) => {
  const { id } = req.params;
  const crypto = require("crypto");

  try {
    // Check if user exists
    const userCheck = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has active streams
    const activeStreams = await db.query(
      "SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL",
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      return res
        .status(400)
        .json({
          error: "Cannot reset stream key while user has active streams",
        });
    }

    // Generate unique stream key
    let streamKey;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      streamKey = crypto.randomBytes(24).toString("hex");

      const existingInSources = await db.query(
        "SELECT id FROM stream_sources WHERE stream_key = $1",
        [streamKey]
      );

      const existingInUsers = await db.query(
        "SELECT id FROM users WHERE stream_key = $1 AND id != $2",
        [streamKey, id]
      );

      if (existingInSources.length === 0 && existingInUsers.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res
        .status(500)
        .json({ error: "Failed to generate unique stream key" });
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
  } catch (error) {
    console.error("Reset stream key error:", error);
    res.status(500).json({ error: "Failed to reset stream key" });
  }
});

// ============================================
// ANALYTICS AND REPORTS
// ============================================

// Get detailed user analytics
router.get("/analytics/users", async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (period === "7d") {
      periodFilter = "NOW() - INTERVAL '7 days'";
    } else if (period === "24h") {
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // User registration trends
    const registrationTrends = await db.query(`
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
    const activityMetrics = await db.query(`
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
    const retentionMetrics = await db.query(`
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
  } catch (error) {
    console.error("Get user analytics error:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

// Get detailed stream analytics
router.get("/analytics/streams", async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (period === "7d") {
      periodFilter = "NOW() - INTERVAL '7 days'";
    } else if (period === "24h") {
      periodFilter = "NOW() - INTERVAL '24 hours'";
    }

    // Stream activity trends
    const streamTrends = await db.query(`
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
    const platformAnalytics = await db.query(`
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
    const qualityMetrics = await db.query(`
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
  } catch (error) {
    console.error("Get stream analytics error:", error);
    res.status(500).json({ error: "Failed to fetch stream analytics" });
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

// Get all subscription plans
router.get("/subscription-plans", async (req, res) => {
  try {
    const plans = await db.query(
      `SELECT
         sp.*,
         COUNT(us.id) as active_subscriptions
       FROM subscription_plans sp
       LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
       GROUP BY sp.id
       ORDER BY sp.price_monthly ASC`
    );

    res.json(plans);
  } catch (error) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
});

// Create new subscription plan
router.post("/subscription-plans", async (req, res) => {
  const {
    name,
    description,
    price_monthly,
    price_yearly,
    max_sources,
    max_destinations,
    max_streaming_hours_monthly,
    features
  } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO subscription_plans (
        name, description, price_monthly, price_yearly,
        max_sources, max_destinations, max_streaming_hours_monthly, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name,
        description,
        price_monthly,
        price_yearly,
        max_sources,
        max_destinations,
        max_streaming_hours_monthly,
        JSON.stringify(features || [])
      ]
    );

    res.json(result);
  } catch (error) {
    console.error("Create subscription plan error:", error);
    res.status(500).json({ error: "Failed to create subscription plan" });
  }
});

// Update subscription plan
router.put("/subscription-plans/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price_monthly,
    price_yearly,
    max_sources,
    max_destinations,
    max_streaming_hours_monthly,
    features
  } = req.body;

  try {
    const result = await db.run(
      `UPDATE subscription_plans SET
        name = $1,
        description = $2,
        price_monthly = $3,
        price_yearly = $4,
        max_sources = $5,
        max_destinations = $6,
        max_streaming_hours_monthly = $7,
        features = $8,
        updated_at = NOW()
      WHERE id = $9 RETURNING *`,
      [
        name,
        description,
        price_monthly,
        price_yearly,
        max_sources,
        max_destinations,
        max_streaming_hours_monthly,
        JSON.stringify(features || []),
        id
      ]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Update subscription plan error:", error);
    res.status(500).json({ error: "Failed to update subscription plan" });
  }
});

// Delete subscription plan
router.delete("/subscription-plans/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if plan has active subscriptions
    const activeSubscriptions = await db.query(
      "SELECT COUNT(*) as count FROM user_subscriptions WHERE plan_id = $1 AND status = 'active'",
      [id]
    );

    if (parseInt(activeSubscriptions[0].count) > 0) {
      return res.status(400).json({
        error: "Cannot delete plan with active subscriptions. Please migrate users to other plans first."
      });
    }

    const result = await db.run(
      "DELETE FROM subscription_plans WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    res.json({ message: "Subscription plan deleted successfully" });
  } catch (error) {
    console.error("Delete subscription plan error:", error);
    res.status(500).json({ error: "Failed to delete subscription plan" });
  }
});

// Get user subscriptions with usage data
router.get("/user-subscriptions", async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get subscriptions with user and plan details
    const subscriptions = await db.query(
      `SELECT
         us.*,
         u.email,
         u.display_name,
         u.avatar_url,
         u.oauth_provider,
         sp.name as plan_name,
         sp.price_monthly,
         sp.price_yearly,
         ut.sources_count,
         ut.destinations_count,
         ut.streaming_hours
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN subscription_plans sp ON us.plan_id = sp.id
       LEFT JOIN usage_tracking ut ON us.user_id = ut.user_id
       WHERE u.email ILIKE $1 OR u.display_name ILIKE $1 OR sp.name ILIKE $1
       ORDER BY us.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    // Get total count for pagination
    const totalCount = await db.query(
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
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    res.status(500).json({ error: "Failed to fetch user subscriptions" });
  }
});

// Update user subscription
router.put("/user-subscriptions/:userId", async (req, res) => {
  const { userId } = req.params;
  const { plan_id, status, current_period_end } = req.body;

  try {
    // Check if user exists
    const userCheck = await db.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if plan exists
    const planCheck = await db.query(
      "SELECT id FROM subscription_plans WHERE id = $1",
      [plan_id]
    );

    if (planCheck.length === 0) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    // Update or create subscription
    const existingSubscription = await db.query(
      "SELECT id FROM user_subscriptions WHERE user_id = $1",
      [userId]
    );

    let result;
    if (existingSubscription.length > 0) {
      // Update existing subscription
      result = await db.run(
        `UPDATE user_subscriptions SET
          plan_id = $1,
          status = $2,
          current_period_end = $3,
          updated_at = NOW()
        WHERE user_id = $4 RETURNING *`,
        [plan_id, status, current_period_end, userId]
      );
    } else {
      // Create new subscription
      result = await db.run(
        `INSERT INTO user_subscriptions (
          user_id, plan_id, status, current_period_start, current_period_end
        ) VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
        [userId, plan_id, status, current_period_end]
      );
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Update user subscription error:", error);
    res.status(500).json({ error: "Failed to update user subscription" });
  }
});

// Get subscription analytics
router.get("/subscription-analytics", async (req, res) => {
  try {
    // Plan distribution
    const planDistribution = await db.query(
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
    const revenueProjection = await db.query(
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
    const growthData = await db.query(
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
  } catch (error) {
    console.error("Get subscription analytics error:", error);
    res.status(500).json({ error: "Failed to fetch subscription analytics" });
  }
});

module.exports = router;
