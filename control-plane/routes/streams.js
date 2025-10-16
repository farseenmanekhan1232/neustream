const express = require('express');
const Database = require('../lib/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Get user's stream info - requires authentication
router.get('/info', authenticateToken, async (req, res) => {
  // Use authenticated user ID instead of query parameter
  const userId = req.user.id;

  try {
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

// Get active streams (for monitoring) - requires authentication
router.get('/active', authenticateToken, async (req, res) => {
  try {
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

// Get RTMP forwarding configuration for a stream key - requires authentication
router.get('/forwarding/:streamKey', authenticateToken, async (req, res) => {
  const { streamKey } = req.params;

  try {
    // Verify the stream key belongs to the authenticated user
    const users = await db.query(
      'SELECT id FROM users WHERE stream_key = $1 AND id = $2',
      [streamKey, req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Stream key not found or unauthorized' });
    }

    const userId = req.user.id;

    // Get active destinations for this user
    const destinations = await db.query(
      'SELECT platform, rtmp_url, stream_key FROM destinations WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    // Build RTMP push configuration
    const pushConfig = destinations.map(dest => {
      // For YouTube, the stream key is appended to the RTMP URL
      if (dest.platform === 'youtube') {
        return `push ${dest.rtmp_url}/${dest.stream_key}`;
      }
      // For other platforms, use the standard format
      return `push ${dest.rtmp_url}/${dest.stream_key}`;
    });

    res.json({
      streamKey,
      userId,
      destinations: destinations,
      pushConfig: pushConfig
    });
  } catch (error) {
    console.error('Get forwarding config error:', error);
    res.status(500).json({ error: 'Failed to fetch forwarding configuration' });
  }
});

module.exports = router;