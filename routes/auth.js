const express = require('express');
const Database = require('../lib/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();
const db = new Database();

// Stream authentication endpoint (called by nginx-rtmp)
router.post('/stream', async (req, res) => {
  const { name: streamKey } = req.body;

  try {
    await db.connect();
    const users = await db.query(
      'SELECT id FROM users WHERE stream_key = ?',
      [streamKey]
    );

    if (users.length === 0) {
      return res.status(401).send('Invalid stream key');
    }

    // Start tracking the active stream
    await db.run(
      'INSERT INTO active_streams (user_id, stream_key) VALUES (?, ?)',
      [users[0].id, streamKey]
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream auth error:', error);
    res.status(500).send('Internal server error');
  } finally {
    db.close();
  }
});

// Stream end callback (called by nginx-rtmp when stream stops)
router.post('/stream-end', async (req, res) => {
  const { name: streamKey } = req.body;

  try {
    // Mark the stream as ended
    await pool.query(
      'UPDATE active_streams SET ended_at = NOW() WHERE stream_key = $1 AND ended_at IS NULL',
      [streamKey]
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream end error:', error);
    res.status(500).send('Internal server error');
  }
});

// User registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const streamKey = crypto.randomBytes(24).toString('hex');

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, stream_key) VALUES ($1, $2, $3) RETURNING id, email, stream_key',
      [email, passwordHash, streamKey]
    );

    res.json({
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        streamKey: result.rows[0].stream_key
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;