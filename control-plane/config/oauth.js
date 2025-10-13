const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitchStrategy = require('passport-twitch-strategy').Strategy;
const Database = require('../lib/database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const posthogService = require('../services/posthog');

const db = new Database();

// JWT secret for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

// Configure Passport Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  console.log('=== GOOGLE OAUTH STRATEGY ===');
  console.log('Profile ID:', profile.id);
  console.log('Profile Email:', profile.emails?.[0]?.value);
  console.log('Profile Display Name:', profile.displayName);
  console.log('Profile Photos:', profile.photos?.[0]?.value);
  try {
    // Check if user exists with this Google ID
    const existingUsers = await db.query(
      'SELECT id, email, display_name, avatar_url, stream_key, oauth_provider, oauth_id FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      ['google', profile.id]
    );

    if (existingUsers.length > 0) {
      // User exists, return user
      const user = existingUsers[0];

      // Update user info from Google (in case it changed)
      await db.run(
        'UPDATE users SET display_name = $1, avatar_url = $2, oauth_email = $3 WHERE id = $4',
        [profile.displayName, profile.photos[0]?.value, profile.emails[0]?.value, user.id]
      );

      // Track successful login
      posthogService.trackAuthEvent(user.id, 'google_login_success');
      posthogService.identifyUser(user.id, {
        email: user.email,
        display_name: profile.displayName,
        oauth_provider: 'google',
        last_login: new Date().toISOString(),
      });

      return done(null, {
        id: user.id,
        email: user.email,
        displayName: profile.displayName,
        avatarUrl: profile.photos[0]?.value,
        streamKey: user.stream_key,
        oauthProvider: 'google',
        isNewUser: false
      });
    }

    // Check if user exists with the same email (for account linking)
    const emailUsers = await db.query(
      'SELECT id, email, password_hash, stream_key, oauth_provider FROM users WHERE email = $1',
      [profile.emails[0]?.value]
    );

    if (emailUsers.length > 0) {
      // User exists with this email, link Google account
      const existingUser = emailUsers[0];

      // If user already has a different OAuth provider, we should still allow linking
      // This handles the case where someone signed up with Twitch and now wants to use Google
      await db.run(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2, display_name = $3, avatar_url = $4, oauth_email = $5 WHERE id = $6',
        ['google', profile.id, profile.displayName, profile.photos[0]?.value, profile.emails[0]?.value, existingUser.id]
      );

      // Track account linking
      posthogService.trackAuthEvent(existingUser.id, 'google_account_linked');
      posthogService.identifyUser(existingUser.id, {
        email: existingUser.email,
        display_name: profile.displayName,
        oauth_provider: 'google',
        account_linked: true,
        previous_oauth_provider: existingUser.oauth_provider
      });

      return done(null, {
        id: existingUser.id,
        email: existingUser.email,
        displayName: profile.displayName,
        avatarUrl: profile.photos[0]?.value,
        streamKey: existingUser.stream_key,
        oauthProvider: 'google',
        isNewUser: false,
        accountLinked: true
      });
    }

    // Create new user
    const streamKey = crypto.randomBytes(24).toString('hex');
    const result = await db.run(
      'INSERT INTO users (email, oauth_provider, oauth_id, display_name, avatar_url, oauth_email, stream_key) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, stream_key',
      [profile.emails[0]?.value, 'google', profile.id, profile.displayName, profile.photos[0]?.value, profile.emails[0]?.value, streamKey]
    );

    // Track new user registration
    posthogService.trackAuthEvent(result.id, 'google_user_registered');
    posthogService.identifyUser(result.id, {
      email: profile.emails[0]?.value,
      display_name: profile.displayName,
      oauth_provider: 'google',
      registered_at: new Date().toISOString(),
    });

    return done(null, {
      id: result.id,
      email: result.email,
      displayName: profile.displayName,
      avatarUrl: profile.photos[0]?.value,
      streamKey: result.stream_key,
      oauthProvider: 'google',
      isNewUser: true
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Configure Passport Twitch OAuth strategy
passport.use(new TwitchStrategy({
  clientID: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  callbackURL: process.env.TWITCH_CALLBACK_URL || "http://localhost:3000/api/auth/twitch/callback",
  scope: ['user:read:email'] // Basic user profile + email
},
async (accessToken, refreshToken, profile, done) => {
  console.log('=== TWITCH OAUTH STRATEGY ===');
  console.log('Profile ID:', profile.id);
  console.log('Profile Login:', profile.login);
  console.log('Profile Display Name:', profile.display_name);
  console.log('Profile Email:', profile.email);
  console.log('Profile Image:', profile.profile_image_url);

  try {
    // Check if user exists with this Twitch ID
    const existingUsers = await db.query(
      'SELECT id, email, display_name, avatar_url, stream_key, oauth_provider, oauth_id FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      ['twitch', profile.id]
    );

    if (existingUsers.length > 0) {
      // User exists, return user
      const user = existingUsers[0];

      // Update user info from Twitch (in case it changed)
      await db.run(
        'UPDATE users SET display_name = $1, avatar_url = $2, oauth_email = $3 WHERE id = $4',
        [profile.display_name, profile.profile_image_url, profile.email, user.id]
      );

      // Track successful login
      posthogService.trackAuthEvent(user.id, 'twitch_login_success');
      posthogService.identifyUser(user.id, {
        email: user.email,
        display_name: profile.display_name,
        oauth_provider: 'twitch',
        last_login: new Date().toISOString(),
      });

      return done(null, {
        id: user.id,
        email: user.email,
        displayName: profile.display_name,
        avatarUrl: profile.profile_image_url,
        streamKey: user.stream_key,
        oauthProvider: 'twitch',
        isNewUser: false
      });
    }

    // Check if user exists with the same email (for account linking)
    const emailUsers = await db.query(
      'SELECT id, email, password_hash, stream_key, oauth_provider FROM users WHERE email = $1',
      [profile.email]
    );

    if (emailUsers.length > 0) {
      // User exists with this email, link Twitch account
      const existingUser = emailUsers[0];

      // If user already has a different OAuth provider, we should still allow linking
      // This handles the case where someone signed up with Google and now wants to use Twitch
      await db.run(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2, display_name = $3, avatar_url = $4, oauth_email = $5 WHERE id = $6',
        ['twitch', profile.id, profile.display_name, profile.profile_image_url, profile.email, existingUser.id]
      );

      // Track account linking
      posthogService.trackAuthEvent(existingUser.id, 'twitch_account_linked');
      posthogService.identifyUser(existingUser.id, {
        email: existingUser.email,
        display_name: profile.display_name,
        oauth_provider: 'twitch',
        account_linked: true,
        previous_oauth_provider: existingUser.oauth_provider
      });

      return done(null, {
        id: existingUser.id,
        email: existingUser.email,
        displayName: profile.display_name,
        avatarUrl: profile.profile_image_url,
        streamKey: existingUser.stream_key,
        oauthProvider: 'twitch',
        isNewUser: false,
        accountLinked: true
      });
    }

    // Create new user
    const streamKey = crypto.randomBytes(24).toString('hex');
    const result = await db.run(
      'INSERT INTO users (email, oauth_provider, oauth_id, display_name, avatar_url, oauth_email, stream_key) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, stream_key',
      [profile.email, 'twitch', profile.id, profile.display_name, profile.profile_image_url, profile.email, streamKey]
    );

    // Track new user registration
    posthogService.trackAuthEvent(result.id, 'twitch_user_registered');
    posthogService.identifyUser(result.id, {
      email: profile.email,
      display_name: profile.display_name,
      oauth_provider: 'twitch',
      registered_at: new Date().toISOString(),
    });

    return done(null, {
      id: result.id,
      email: result.email,
      displayName: profile.display_name,
      avatarUrl: profile.profile_image_url,
      streamKey: result.stream_key,
      oauthProvider: 'twitch',
      isNewUser: true
    });

  } catch (error) {
    console.error('Twitch OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const users = await db.query(
      'SELECT id, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1',
      [id]
    );

    if (users.length > 0) {
      const user = users[0];
      done(null, {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        streamKey: user.stream_key,
        oauthProvider: user.oauth_provider
      });
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

// Generate JWT token for API authentication
function generateToken(user) {
  console.log('=== GENERATING JWT TOKEN ===');
  console.log('User data for token:', user);
  console.log('JWT Secret available:', !!JWT_SECRET);
  console.log('JWT Secret length:', JWT_SECRET.length);

  const payload = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    streamKey: user.streamKey,
    oauthProvider: user.oauthProvider
  };

  console.log('Token payload:', payload);

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    console.log('Token generated successfully, length:', token.length);
    return token;
  } catch (error) {
    console.error('JWT Token generation failed:', error);
    throw error;
  }
}

module.exports = {
  passport,
  generateToken,
  JWT_SECRET
};