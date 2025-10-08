const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Get user's stream info
router.get('/info', async (req, res) => {
  const { userId } = req.query;

  try {
    // Get user's stream key
    const userResult = await pool.query(
      'SELECT stream_key FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const streamKey = userResult.rows[0].stream_key;

    // Check if stream is active
    const streamResult = await pool.query(
      'SELECT * FROM active_streams WHERE user_id = $1 AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
      [userId]
    );

    const isActive = streamResult.rows.length > 0;

    res.json({
      streamKey,
      isActive,
      rtmpUrl: `rtmp://${process.env.MEDIA_SERVER_HOST}/live`,
      activeStream: isActive ? streamResult.rows[0] : null
    });
  } catch (error) {
    console.error('Get stream info error:', error);
    res.status(500).json({ error: 'Failed to fetch stream info' });
  }
});

// Get active streams (for monitoring)
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.*,
        u.email
      FROM active_streams s
      JOIN users u ON s.user_id = u.id
      WHERE s.ended_at IS NULL
      ORDER BY s.started_at DESC
    `);

    res.json({ activeStreams: result.rows });
  } catch (error) {
    console.error('Get active streams error:', error);
    res.status(500).json({ error: 'Failed to fetch active streams' });
  }
});

module.exports = router;