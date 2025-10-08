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
      'SELECT id FROM users WHERE stream_key = $1',
      [streamKey]
    );

    if (users.length === 0) {
      return res.status(401).send('Invalid stream key');
    }

    // Start tracking the active stream
    await db.run(
      'INSERT INTO active_streams (user_id, stream_key) VALUES ($1, $2)',
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
    await db.connect();
    // Mark the stream as ended
    await db.run(
      'UPDATE active_streams SET ended_at = NOW() WHERE stream_key = $1 AND ended_at IS NULL',
      [streamKey]
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream end error:', error);
    res.status(500).send('Internal server error');
  } finally {
    db.close();
  }
});

// User registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    await db.connect();
    const passwordHash = await bcrypt.hash(password, 12);
    const streamKey = crypto.randomBytes(24).toString('hex');

    const result = await db.run(
      'INSERT INTO users (email, password_hash, stream_key) VALUES ($1, $2, $3) RETURNING id, email, stream_key',
      [email, passwordHash, streamKey]
    );

    res.json({
      user: {
        id: result.id,
        email: email,
        streamKey: streamKey
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    db.close();
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    await db.connect();
    const users = await db.query(
      'SELECT id, email, password_hash, stream_key FROM users WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        streamKey: user.stream_key
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    db.close();
  }
});

module.exports = router;