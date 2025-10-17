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
    let sourceInfo = null;
    let userId = null;

    // First, try to find the stream key in stream_sources table (new architecture)
    const sources = await db.query(
      'SELECT s.*, u.email FROM stream_sources s JOIN users u ON s.user_id = u.id WHERE s.stream_key = $1 AND s.is_active = true',
      [streamKey]
    );

    if (sources.length > 0) {
      // Found in stream_sources table (new architecture)
      sourceInfo = sources[0];
      userId = sourceInfo.user_id;

      console.log(`Stream authenticated via stream_sources: user=${sourceInfo.email}, source=${sourceInfo.name}`);
    } else {
      // Fallback to legacy users table for backward compatibility
      const users = await db.query(
        'SELECT id, email FROM users WHERE stream_key = $1',
        [streamKey]
      );

      if (users.length > 0) {
        // Found in users table (legacy architecture)
        userId = users[0].id;

        console.log(`Stream authenticated via legacy users table: user=${users[0].email}`);

        // For legacy streams, we don't have a source_id, but we still track them
        posthogService.trackStreamEvent(userId, streamKey, 'legacy_stream_auth', {
          authentication_method: 'legacy_users_table'
        });
      } else {
        // Stream key not found anywhere
        posthogService.trackStreamEvent('anonymous', streamKey, 'stream_auth_failed', {
          reason: 'invalid_stream_key',
          attempted_tables: ['stream_sources', 'users']
        });
        return res.status(401).send('Invalid stream key');
      }
    }

    // Check if there's already an active stream with this key
    const existingActiveStream = await db.query(
      'SELECT id FROM active_streams WHERE stream_key = $1 AND ended_at IS NULL',
      [streamKey]
    );

    if (existingActiveStream.length > 0) {
      console.log(`Stream ${streamKey} is already active, updating existing record`);

      // Update the last activity timestamp for the existing stream
      if (sourceInfo) {
        await db.run(
          'UPDATE stream_sources SET last_used_at = NOW() WHERE id = $1',
          [sourceInfo.id]
        );
      }

      // Track duplicate stream attempt
      posthogService.trackStreamEvent(userId, streamKey, 'duplicate_stream_attempt', {
        source_id: sourceInfo?.id,
        source_name: sourceInfo?.name
      });

      return res.status(200).send('OK');
    }

    // Start tracking the active stream with source_id if available
    const insertQuery = sourceInfo
      ? 'INSERT INTO active_streams (source_id, user_id, stream_key) VALUES ($1, $2, $3) RETURNING id'
      : 'INSERT INTO active_streams (user_id, stream_key) VALUES ($1, $2) RETURNING id';

    const insertParams = sourceInfo
      ? [sourceInfo.id, userId, streamKey]
      : [userId, streamKey];

    const result = await db.run(insertQuery, insertParams);

    // Update last_used_at timestamp for the source
    if (sourceInfo) {
      await db.run(
        'UPDATE stream_sources SET last_used_at = NOW() WHERE id = $1',
        [sourceInfo.id]
      );
    }

    // Track successful stream authentication
    posthogService.trackStreamEvent(userId, streamKey, 'stream_auth_success', {
      source_id: sourceInfo?.id,
      source_name: sourceInfo?.name,
      authentication_method: sourceInfo ? 'stream_sources_table' : 'legacy_users_table',
      active_stream_id: result.id
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream auth error:', error);
    posthogService.trackStreamEvent('anonymous', streamKey, 'stream_auth_error', {
      error_message: error.message,
      error_code: error.code
    });
    res.status(500).send('Internal server error');
  }
});

// Stream end callback (called by nginx-rtmp when stream stops)
router.post('/stream-end', async (req, res) => {
  // nginx-rtmp sends stream key as URL-encoded form data, not JSON
  const streamKey = req.body.name || req.query.name;

  try {
    // Get active stream details for tracking
    const activeStreams = await db.query(
      `SELECT
        as_.*,
        ss.name as source_name,
        ss.id as source_id,
        u.email
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      LEFT JOIN users u ON as_.user_id = u.id
      WHERE as_.stream_key = $1 AND as_.ended_at IS NULL`,
      [streamKey]
    );

    if (activeStreams.length === 0) {
      console.log(`No active stream found for key: ${streamKey}`);
      return res.status(200).send('OK'); // Still return OK to prevent media server retries
    }

    const activeStream = activeStreams[0];

    // Calculate stream duration
    const startTime = new Date(activeStream.started_at);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

    // Mark the stream as ended with duration
    await db.run(
      `UPDATE active_streams
       SET ended_at = NOW(),
           destinations_count = COALESCE(
             (SELECT COUNT(*) FROM source_destinations sd
              WHERE sd.source_id = $1 AND sd.is_active = true),
             (SELECT COUNT(*) FROM destinations d
              WHERE d.user_id = $2 AND d.is_active = true),
             0
           )
       WHERE stream_key = $3 AND ended_at IS NULL`,
      [activeStream.source_id, activeStream.user_id, streamKey]
    );

    // Track stream end with detailed information
    posthogService.trackStreamEvent(activeStream.user_id, streamKey, 'stream_ended', {
      source_id: activeStream.source_id,
      source_name: activeStream.source_name,
      duration_seconds: duration,
      stream_type: activeStream.source_id ? 'multi_source' : 'legacy',
      active_stream_id: activeStream.id,
      user_email: activeStream.email
    });

    console.log(`Stream ended: key=${streamKey}, user=${activeStream.email}, source=${activeStream.source_name || 'legacy'}, duration=${duration}s`);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Stream end error:', error);
    posthogService.trackStreamEvent('anonymous', streamKey, 'stream_end_error', {
      error_message: error.message,
      error_code: error.code
    });
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

    // Generate JWT token for API authentication
    const token = generateToken({
      id: userId,
      email: email,
      displayName: null,
      avatarUrl: null,
      streamKey: streamKey,
      oauthProvider: null
    });

    res.json({
      token,
      user: {
        id: userId,
        email: email,
        displayName: null,
        avatarUrl: null,
        streamKey: streamKey,
        oauthProvider: null
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
      'SELECT id, email, password_hash, stream_key, display_name, avatar_url, oauth_provider FROM users WHERE email = $1',
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

    // Generate JWT token for API authentication
    const token = generateToken({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      streamKey: user.stream_key,
      oauthProvider: user.oauth_provider
    });

    res.json({
      token,
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

// Twitch OAuth endpoints
router.get('/twitch',
  passport.authenticate('twitch')
);

router.get('/twitch/callback',
  (req, res, next) => {
    console.log('=== TWITCH OAUTH CALLBACK START ===');
    console.log('Callback URL:', req.url);
    console.log('Callback Query:', req.query);
    console.log('Callback Code:', req.query.code);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    next();
  },
  passport.authenticate('twitch', { session: false }),
  (req, res) => {
    console.log('=== TWITCH OAUTH CALLBACK PROCESSING ===');
    console.log('Authenticated user:', req.user);

    if (!req.user) {
      console.error('No user found in Twitch OAuth callback');
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
    console.log('=== TWITCH OAUTH CALLBACK COMPLETE ===');
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