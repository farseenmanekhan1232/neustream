import express, { Request, Response } from 'express';
import Database from '../../lib/database';

const router = express.Router();
const db = new Database();

/**
 * GET /api/admin/chat-connectors
 * Get all chat connectors across all users
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '', platform = '', status = '' } = req.query as any;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      whereClause += ` AND (
        u.email ILIKE $${paramIndex} OR
        ss.name ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Platform filter
    if (platform) {
      whereClause += ` AND cc.platform = $${paramIndex}`;
      params.push(platform);
      paramIndex++;
    }

    // Status filter
    if (status === 'active') {
      whereClause += ` AND cc.is_active = true`;
    } else if (status === 'inactive') {
      whereClause += ` AND cc.is_active = false`;
    }

    // Get chat connectors
    const connectors = await db.query<any>(`
      SELECT
        cc.id,
        cc.source_id,
        cc.platform,
        cc.connector_type,
        cc.is_active,
        cc.created_at,
        cc.updated_at,
        ss.name as source_name,
        ss.user_id,
        u.email as user_email,
        u.display_name as user_name,
        COUNT(*) OVER() as total_count
      FROM chat_connectors cc
      JOIN stream_sources ss ON cc.source_id = ss.id
      JOIN users u ON ss.user_id = u.id
      ${whereClause}
      ORDER BY cc.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get stats
    const stats = await db.query<any>(`
      SELECT
        COUNT(*) as total_connectors,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_connectors,
        COUNT(CASE WHEN platform = 'youtube' THEN 1 END) as youtube_count,
        COUNT(CASE WHEN platform = 'twitch' THEN 1 END) as twitch_count
      FROM chat_connectors
    `);

    // Get recent chat messages count
    const messageStats = await db.query<any>(`
      SELECT COUNT(*) as total_messages
      FROM chat_messages
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);

    const totalCount = connectors.length > 0 ? parseInt(connectors[0].total_count) : 0;

    res.json({
      data: connectors,
      stats: {
        ...stats[0],
        messages_24h: messageStats[0]?.total_messages || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Get chat connectors error:', error);
    res.status(500).json({ error: 'Failed to fetch chat connectors' });
  }
});

/**
 * GET /api/admin/chat-connectors/:id
 * Get specific chat connector details with recent messages
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const connector = await db.query<any>(`
      SELECT
        cc.*,
        ss.name as source_name,
        u.email as user_email,
        u.display_name as user_name
      FROM chat_connectors cc
      JOIN stream_sources ss ON cc.source_id = ss.id
      JOIN users u ON ss.user_id = u.id
      WHERE cc.id = $1
    `, [id]);

    if (connector.length === 0) {
      res.status(404).json({ error: 'Chat connector not found' });
      return;
    }

    // Get recent messages
    const messages = await db.query<any>(`
      SELECT *
      FROM chat_messages
      WHERE connector_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    res.json({
      data: {
        ...connector[0],
        recentMessages: messages,
      },
    });
  } catch (error: any) {
    console.error('Get chat connector details error:', error);
    res.status(500).json({ error: 'Failed to fetch chat connector details' });
  }
});

/**
 * POST /api/admin/chat-connectors/:id/toggle
 * Toggle chat connector active status
 */
router.post('/:id/toggle', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.run(`
      UPDATE chat_connectors
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (!result) {
      res.status(404).json({ error: 'Chat connector not found' });
      return;
    }

    res.json({ data: result });
  } catch (error: any) {
    console.error('Toggle chat connector error:', error);
    res.status(500).json({ error: 'Failed to toggle chat connector' });
  }
});

export default router;
