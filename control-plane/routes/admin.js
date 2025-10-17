const express = require('express');
const Database = require('../lib/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.email !== 'admin@neustream.app') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateToken, requireAdmin);

// Get all users with their streaming info
router.get('/users', async (req, res) => {
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
        COALESCE(active.active_count, 0) as active_streams,
        u.last_login
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
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get specific user details with their sources and streams
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get user basic info
    const users = await db.query(`
      SELECT id, email, display_name, avatar_url, oauth_provider, stream_key, created_at
      FROM users WHERE id = $1
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get user's stream sources
    const sources = await db.query(`
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
    `, [id]);

    // Get user's active streams
    const activeStreams = await db.query(`
      SELECT
        as_.*,
        ss.name as source_name
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      WHERE as_.user_id = $1 AND as_.ended_at IS NULL
      ORDER BY as_.started_at DESC
    `, [id]);

    // Get stream statistics
    const streamStats = await db.query(`
      SELECT
        COUNT(*) as total_streams,
        AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
      FROM active_streams
      WHERE user_id = $1 AND ended_at IS NOT NULL
    `, [id]);

    res.json({
      user: {
        ...user,
        sources,
        activeStreams,
        stats: {
          totalStreams: parseInt(streamStats[0]?.total_streams) || 0,
          avgDuration: parseFloat(streamStats[0]?.avg_duration) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
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
        activeStreams: parseInt(activeStreamsCount[0]?.active_streams) || 0
      },
      destinations: destStats[0],
      activity: recentActivity[0],
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// Get analytics data for charts
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let interval = 'day';
    let periodFilter = "NOW() - INTERVAL '7 days'";

    if (period === '30d') {
      periodFilter = "NOW() - INTERVAL '30 days'";
    } else if (period === '24h') {
      interval = 'hour';
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
      oauthDistribution
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Update user (basic info)
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { displayName, isActive } = req.body;

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' });
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
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    res.json({ user: result[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (with cascading deletes)
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT id, email FROM users WHERE id = $1', [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has active streams
    const activeStreams = await db.query(
      'SELECT COUNT(*) as count FROM active_streams WHERE user_id = $1 AND ended_at IS NULL',
      [id]
    );

    if (parseInt(activeStreams[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete user with active streams' });
    }

    // Delete user (cascades to sources, destinations, etc.)
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      message: 'User deleted successfully',
      userEmail: userCheck[0].email
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbTest = await db.query('SELECT 1 as test');

    // Check recent stream activity
    const recentActivity = await db.query(`
      SELECT COUNT(*) as count
      FROM active_streams
      WHERE started_at > NOW() - INTERVAL '5 minutes'
    `);

    res.json({
      status: 'healthy',
      database: dbTest.length > 0 ? 'connected' : 'disconnected',
      recentActivity: parseInt(recentActivity[0].count),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;