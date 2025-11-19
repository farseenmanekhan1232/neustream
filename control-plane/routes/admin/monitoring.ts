import express, { Request, Response } from 'express';
import Database from '../../lib/database';

const router = express.Router();
const db = new Database();

/**
 * GET /api/admin/monitoring
 * Get comprehensive system monitoring data
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get active streaming sessions
    const activeSessions = await db.query<any>(`
      SELECT COUNT(*) as count
      FROM active_streams
      WHERE ended_at IS NULL
    `);

    // Get usage tracking stats (last 30 days)
    const usageStats = await db.query<any>(`
      SELECT
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_minutes,
        AVG(duration_minutes) as avg_duration,
        MAX(duration_minutes) as max_duration
      FROM usage_tracking
      WHERE stream_start >= NOW() - INTERVAL '30 days'
    `);

    // Get plan limits tracking
    const limitsTracking = await db.query<any>(`
      SELECT
        u.email,
        u.id as user_id,
        plt.current_sources_count,
        plt.current_destinations_count,
        plt.current_month_streaming_hours,
        sp.name as plan_name,
        (plt.current_sources_count::float / NULLIF((sp.limits->>'max_sources')::int, 0) * 100) as sources_usage_percent,
        (plt.current_destinations_count::float / NULLIF((sp.limits->>'max_destinations')::int, 0) * 100) as destinations_usage_percent,
        (plt.current_month_streaming_hours::float / NULLIF((sp.limits->>'max_streaming_hours_monthly')::int, 0) * 100) as hours_usage_percent
      FROM plan_limits_tracking plt
      JOIN users u ON plt.user_id = u.id
      JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE 
        plt.current_sources_count > 0 OR
        plt.current_destinations_count > 0 OR
        plt.current_month_streaming_hours > 0
      ORDER BY plt.current_month_streaming_hours DESC
      LIMIT 20
    `);

    // Get limit violations (users exceeding limits)
    const limitViolations = await db.query<any>(`
      SELECT
        u.email,
        u.id as user_id,
        sp.name as plan_name,
        plt.current_sources_count,
        (sp.limits->>'max_sources')::int as max_sources,
        plt.current_destinations_count,
        (sp.limits->>'max_destinations')::int as max_destinations,
        plt.current_month_streaming_hours,
        (sp.limits->>'max_streaming_hours_monthly')::int as max_hours
      FROM plan_limits_tracking plt
      JOIN users u ON plt.user_id = u.id
      JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE
        plt.current_sources_count > (sp.limits->>'max_sources')::int OR
        plt.current_destinations_count > (sp.limits->>'max_destinations')::int OR
        plt.current_month_streaming_hours > (sp.limits->>'max_streaming_hours_monthly')::int
    `);

    // Get database stats
    const dbStats = await db.query<any>(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stream_sources) as total_sources,
        (SELECT COUNT(*) FROM source_destinations) as total_destinations,
        (SELECT COUNT(*) FROM chat_connectors) as total_chat_connectors,
        (SELECT COUNT(*) FROM active_streams WHERE ended_at IS NULL) as active_streams,
        (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as active_subscriptions
    `);

    // Get streaming hours by month (last 6 months)
    const monthlyHours = await db.query<any>(`
      SELECT
        month_year,
        SUM(duration_minutes) / 60 as total_hours,
        COUNT(*) as session_count
      FROM usage_tracking
      WHERE month_year >= TO_CHAR(NOW() - INTERVAL '6 months', 'YYYY-MM')
      GROUP BY month_year
      ORDER BY month_year DESC
    `);

    res.json({
      data: {
        activeStreams: activeSessions[0]?.count || 0,
        usageStats: usageStats[0] || {},
        limitsTracking,
        limitViolations,
        dbStats: dbStats[0] || {},
        monthlyHours,
      },
    });
  } catch (error: any) {
    console.error('Get monitoring data error:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
});

/**
 * GET /api/admin/monitoring/health
 * Get system health check
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    await db.query('SELECT 1');

    // Get process uptime and memory
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    res.json({
      data: {
        status: 'healthy',
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      data: {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
