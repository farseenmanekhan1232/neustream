const express = require('express');
const Database = require('../lib/database');

const router = express.Router();
const db = new Database();

// Get user's destinations
router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    // Validate user exists
    const users = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const destinations = await db.query(
      'SELECT * FROM destinations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ destinations });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Add new destination
router.post('/', async (req, res) => {
  const { userId, platform, rtmpUrl, streamKey } = req.body;

  try {
    // Validate user exists
    const users = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await db.run(
      'INSERT INTO destinations (user_id, platform, rtmp_url, stream_key) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, platform, rtmpUrl, streamKey]
    );

    res.json({ destination: result });
  } catch (error) {
    console.error('Add destination error:', error);
    res.status(500).json({ error: 'Failed to add destination' });
  }
});

// Update destination
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { platform, rtmpUrl, streamKey, isActive } = req.body;

  try {
    const result = await db.run(
      'UPDATE destinations SET platform = $1, rtmp_url = $2, stream_key = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [platform, rtmpUrl, streamKey, isActive, id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ destination: result });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ error: 'Failed to update destination' });
  }
});

// Delete destination
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.run('DELETE FROM destinations WHERE id = $1', [id]);
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ error: 'Failed to delete destination' });
  }
});

module.exports = router;