const express = require('express');
const Database = require('../lib/database');

const router = express.Router();
const db = new Database();

// Get user's stream info
router.get('/info', async (req, res) => {
  const { userId } = req.query;

  try {
    await db.connect();

    // Get user's stream key
    const users = await db.query(
      'SELECT stream_key FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const streamKey = users[0].stream_key;

    // Check if stream is active
    const activeStreams = await db.query(
      'SELECT * FROM active_streams WHERE user_id = $1 AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
      [userId]
    );

    const isActive = activeStreams.length > 0;

    res.json({
      streamKey,
      isActive,
      rtmpUrl: `rtmp://${process.env.STREAM_DOMAIN || process.env.MEDIA_SERVER_HOST}/live`,
      activeStream: isActive ? activeStreams[0] : null
    });
  } catch (error) {
    console.error('Get stream info error:', error);
    res.status(500).json({ error: 'Failed to fetch stream info' });
  }
});

// Get active streams (for monitoring)
router.get('/active', async (req, res) => {
  try {
    await db.connect();

    const activeStreams = await db.query(`
      SELECT
        s.*,
        u.email
      FROM active_streams s
      JOIN users u ON s.user_id = u.id
      WHERE s.ended_at IS NULL
      ORDER BY s.started_at DESC
    `);

    res.json({ activeStreams });
  } catch (error) {
    console.error('Get active streams error:', error);
    res.status(500).json({ error: 'Failed to fetch active streams' });
  }
});

module.exports = router;