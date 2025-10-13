const express = require('express');
const Database = require('../lib/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const posthogService = require('../services/posthog');
const { passport, generateToken, JWT_SECRET } = require('../config/oauth');

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

// Google OAuth endpoints
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('=== GOOGLE OAUTH CALLBACK START ===');
    console.log('Callback URL:', req.url);
    console.log('Callback Query:', req.query);
    console.log('Callback Code:', req.query.code);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    next();
  },
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      console.log('=== GOOGLE OAUTH CALLBACK PROCESSING ===');
      console.log('Authenticated user:', req.user);

      if (!req.user) {
        console.error('No user found in OAuth callback');
        return res.status(400).json({ error: 'Authentication failed' });
      }

      // Generate JWT token for the authenticated user
      const token = generateToken(req.user);
      console.log('Generated JWT token:', token.substring(0, 20) + '...');

      // Redirect to frontend auth page with token
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.neustream.app';
      const userData = encodeURIComponent(JSON.stringify(req.user));
      const redirectUrl = `${frontendUrl}/auth?token=${token}&user=${userData}`;

      console.log('Redirect URL:', redirectUrl);
      console.log('Redirect URL length:', redirectUrl.length);
      console.log('Token length:', token.length);
      console.log('User data length:', userData.length);

      // Check if URL is too long (browser limit is ~2000 chars)
      if (redirectUrl.length > 2000) {
        console.warn('Redirect URL is very long, might cause issues');
      }

      res.redirect(redirectUrl);
      console.log('=== GOOGLE OAUTH CALLBACK COMPLETE ===');
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ error: 'OAuth callback failed', details: error.message });
    }
  }
);

// Google OAuth for API-based authentication (for frontend popup flow)
router.post('/google/token',
  passport.authenticate('google-token', { session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user);
      res.json({
        token,
        user: req.user
      });
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({ error: 'Token generation failed' });
    }
  }
);

// JWT token validation endpoint
router.post('/validate-token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    console.log('Validating token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Verify user still exists
    const users = await db.query(
      'SELECT id, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('User not found for userId:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = users[0];
    console.log('User found:', user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        streamKey: user.stream_key,
        oauthProvider: user.oauth_provider
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;