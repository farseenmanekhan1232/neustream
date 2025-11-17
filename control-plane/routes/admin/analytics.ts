import express, { Request, Response } from "express";
import Database from "../../lib/database";

const router = express.Router();
const db = new Database();

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
        COUNT(CASE WHEN sd.platform = 'youtube' THEN 1 END) as youtube_dests,
        COUNT(CASE WHEN sd.platform = 'twitch' THEN 1 END) as twitch_dests,
        COUNT(CASE WHEN sd.platform = 'facebook' THEN 1 END) as facebook_dests
      FROM source_destinations sd
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
      data: {
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
      },
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch system statistics" });
  }
});

// Get analytics data for charts
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = "7d" } = req.query as any;

    // Whitelist interval values to prevent SQL injection
    const validIntervals = ["hour", "day", "week", "month"];
    const validPeriods = ["24h", "7d", "30d"];

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
    const userTrends = await db.query<any>(
      `
      SELECT
        DATE_TRUNC($1, created_at) as period,
        COUNT(*) as users
      FROM users
      WHERE created_at > ${periodFilter}
      GROUP BY DATE_TRUNC($1, created_at)
      ORDER BY period ASC
    `,
      [interval],
    );

    // Get stream activity trends
    const streamTrends = await db.query<any>(
      `
      SELECT
        DATE_TRUNC($1, started_at) as period,
        COUNT(*) as streams_started,
        COUNT(CASE WHEN ended_at IS NOT NULL THEN 1 END) as streams_completed
      FROM active_streams
      WHERE started_at > ${periodFilter}
      GROUP BY DATE_TRUNC($1, started_at)
      ORDER BY period ASC
    `,
      [interval],
    );

    // Get platform distribution
    const platformDistribution = await db.query<any>(`
      SELECT
        sd.platform,
        COUNT(*) as count
      FROM source_destinations sd
      WHERE sd.is_active = true
      GROUP BY sd.platform
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
      data: {
        userTrends,
        streamTrends,
        platformDistribution,
        oauthDistribution,
      },
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// Get detailed user analytics
router.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = "30d" } = req.query as any;

    // Whitelist period values
    const validPeriods = ["24h", "7d", "30d"];
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (validPeriods.includes(period)) {
      periodFilter =
        period === "24h"
          ? "NOW() - INTERVAL '24 hours'"
          : period === "7d"
            ? "NOW() - INTERVAL '7 days'"
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
      data: {
        registrationTrends,
        activityMetrics: activityMetrics[0],
        retentionMetrics,
      },
    });
  } catch (error: any) {
    console.error("Get user analytics error:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

// Get detailed stream analytics
router.get("/streams", async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = "30d" } = req.query as any;

    // Whitelist period values
    const validPeriods = ["24h", "7d", "30d"];
    let periodFilter = "NOW() - INTERVAL '30 days'";

    if (validPeriods.includes(period)) {
      periodFilter =
        period === "24h"
          ? "NOW() - INTERVAL '24 hours'"
          : period === "7d"
            ? "NOW() - INTERVAL '7 days'"
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
      data: {
        streamTrends,
        platformAnalytics,
        qualityMetrics: qualityMetrics[0],
      },
    });
  } catch (error: any) {
    console.error("Get stream analytics error:", error);
    res.status(500).json({ error: "Failed to fetch stream analytics" });
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
       ORDER BY user_count DESC`,
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
       ORDER BY monthly_revenue DESC`,
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
       LIMIT 12`);

    res.json({
      data: {
        planDistribution,
        revenueProjection,
        growthData,
      },
    });
  } catch (error: any) {
    console.error("Get subscription analytics error:", error);
    res.status(500).json({ error: "Failed to fetch subscription analytics" });
  }
});

export default router;
