const express = require('express');
const Database = require('../lib/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const posthogService = require('../services/posthog');

const router = express.Router();

// Create a shared database instance for all routes
const db = new Database();

// Pre-connect to database when the module loads
db.connect().catch(err => {
  console.error('Failed to pre-connect to database:', err);
});

// Stream authentication endpoint (called by nginx-rtmp)
router.post('/stream', async (req, res) => {
  // nginx-rtmp sends stream key as URL-encoded form data, not JSON
  const streamKey = req.body.name || req.query.name;

  try {
    const users = await db.query(
      'SELECT id FROM users WHERE stream_key = $1',
      [streamKey]
    );

    if (users.length === 0) {
      posthogService.trackStreamEvent('anonymous', streamKey, 'stream_auth_failed', {
        reason: 'invalid_stream_key'
      });
      return res.status(401).send('Invalid stream key');
    }

    const userId = users[0].id;

    // Start tracking the active stream
    await db.run(
      'INSERT INTO active_streams (user_id, stream_key) VALUES ($1, $2)',
      [userId, streamKey]
    );

    // Track successful stream authentication
    posthogService.trackStreamEvent(userId, streamKey, 'stream_auth_success');

    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream auth error:', error);
    res.status(500).send('Internal server error');
  }
});

// Stream end callback (called by nginx-rtmp when stream stops)
router.post('/stream-end', async (req, res) => {
  // nginx-rtmp sends stream key as URL-encoded form data, not JSON
  const streamKey = req.body.name || req.query.name;

  try {
    // Get user ID for tracking
    const users = await db.query(
      'SELECT user_id FROM active_streams WHERE stream_key = $1 AND ended_at IS NULL',
      [streamKey]
    );

    // Mark the stream as ended
    await db.run(
      'UPDATE active_streams SET ended_at = NOW() WHERE stream_key = $1 AND ended_at IS NULL',
      [streamKey]
    );

    // Track stream end
    if (users.length > 0) {
      const userId = users[0].user_id;
      posthogService.trackStreamEvent(userId, streamKey, 'stream_ended');
    }

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

    const result = await db.run(
      'INSERT INTO users (email, password_hash, stream_key) VALUES ($1, $2, $3) RETURNING id, email, stream_key',
      [email, passwordHash, streamKey]
    );

    const userId = result.id;

    // Track successful registration
    posthogService.trackAuthEvent(userId, 'user_registered');
    posthogService.identifyUser(userId, {
      email: email,
      registered_at: new Date().toISOString(),
    });

    res.json({
      user: {
        id: userId,
        email: email,
        streamKey: streamKey
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Provide more specific error messages
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email already exists' });
    } else if (error.code === '23502') { // Not null violation
      res.status(400).json({ error: 'Email and password are required' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await db.query(
      'SELECT id, email, password_hash, stream_key FROM users WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      posthogService.trackAuthEvent('anonymous', 'login_failed', {
        reason: 'user_not_found',
        email: email
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      posthogService.trackAuthEvent(user.id, 'login_failed', {
        reason: 'invalid_password',
        email: email
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Track successful login
    posthogService.trackAuthEvent(user.id, 'login_success');
    posthogService.identifyUser(user.id, {
      email: user.email,
      last_login: new Date().toISOString(),
    });

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
  }
});

module.exports = router;