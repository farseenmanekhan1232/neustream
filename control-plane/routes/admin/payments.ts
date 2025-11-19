import express, { Request, Response } from 'express';
import Database from '../../lib/database';

const router = express.Router();
const db = new Database();

/**
 * GET /api/admin/payments
 * Get all payment orders and transactions with pagination
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query as any;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      whereClause += ` AND (
        po.order_id ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex} OR
        sp.name ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status) {
      whereClause += ` AND po.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Get payments with user and plan details
    const payments = await db.query<any>(`
      SELECT
        po.id,
        po.order_id,
        po.user_id,
        po.plan_id,
        po.amount,
        po.currency,
        po.status,
        po.billing_cycle,
        po.created_at,
        po.updated_at,
        u.email as user_email,
        u.display_name as user_name,
        sp.name as plan_name,
        COUNT(*) OVER() as total_count
      FROM payment_orders po
      JOIN users u ON po.user_id = u.id
      JOIN subscription_plans sp ON po.plan_id = sp.id
      ${whereClause}
      ORDER BY po.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get stats
    const stats = await db.query<any>(`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
      FROM payment_orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const totalCount = payments.length > 0 ? parseInt(payments[0].total_count) : 0;

    res.json({
      data: payments,
      stats: stats[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/admin/payments/:id
 * Get specific payment details
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await db.query<any>(`
      SELECT
        po.*,
        u.email as user_email,
        u.display_name as user_name,
        sp.name as plan_name,
        sp.description as plan_description
      FROM payment_orders po
      JOIN users u ON po.user_id = u.id
      JOIN subscription_plans sp ON po.plan_id = sp.id
      WHERE po.id = $1 OR po.order_id = $1
    `, [id]);

    if (payment.length === 0) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.json({ data: payment[0] });
  } catch (error: any) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

export default router;
