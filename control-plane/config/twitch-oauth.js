const passport = require('passport');
const TwitchStrategy = require('passport-twitch-strategy').Strategy;
const Database = require('../lib/database');
const crypto = require('crypto');
const posthogService = require('../services/posthog');

const db = new Database();

// Twitch OAuth configuration
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_CALLBACK_URL = process.env.TWITCH_CALLBACK_URL || "http://localhost:3000/api/auth/twitch/callback";

// Configure Passport Twitch OAuth strategy
passport.use(new TwitchStrategy({
  clientID: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_CLIENT_SECRET,
  callbackURL: TWITCH_CALLBACK_URL,
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
      'SELECT id, email, password_hash, stream_key FROM users WHERE email = $1 AND oauth_provider IS NULL',
      [profile.email]
    );

    if (emailUsers.length > 0) {
      // User exists with email/password, link Twitch account
      const existingUser = emailUsers[0];

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

module.exports = {
  passport
};