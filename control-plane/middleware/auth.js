const jwt = require('jsonwebtoken');
const Database = require('../lib/database');
const { JWT_SECRET } = require('./oauth');

const db = new Database();

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  console.log('=== JWT AUTHENTICATION MIDDLEWARE ===');
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  console.log('Headers:', req.headers);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Authorization header found:', !!authHeader);
  console.log('Token extracted:', !!token);

  if (!token) {
    console.log('No token provided, returning 401');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);

    // Verify user still exists in database
    const users = await db.query(
      'SELECT id, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('User not found in database:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = users[0];
    console.log('User authenticated:', { id: user.id, email: user.email });

    // Attach user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      streamKey: user.stream_key,
      oauthProvider: user.oauth_provider
    };

    console.log('Authentication successful, proceeding to next handler');
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'Authentication error' });
    }
  }
};

// Optional authentication - doesn't fail if no token, but attaches user if valid
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token, but proceed without authentication
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = await db.query(
      'SELECT id, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (users.length > 0) {
      req.user = {
        id: users[0].id,
        email: users[0].email,
        displayName: users[0].display_name,
        avatarUrl: users[0].avatar_url,
        streamKey: users[0].stream_key,
        oauthProvider: users[0].oauth_provider
      };
    }
  } catch (error) {
    console.error('Optional auth token verification failed:', error);
    // Don't fail the request, just proceed without user info
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};