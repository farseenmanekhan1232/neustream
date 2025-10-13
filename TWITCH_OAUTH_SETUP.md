# Twitch OAuth Setup Guide for NeuStream

This guide walks you through setting up Twitch OAuth authentication for your NeuStream application.

## Prerequisites

- A Twitch Developer account (create one at https://dev.twitch.tv/)
- Your NeuStream application deployed with HTTPS (required for OAuth callbacks)
- Access to your NeuStream control plane environment variables

## Step 1: Create a Twitch Application

1. **Go to Twitch Developers Console**
   - Visit https://dev.twitch.tv/console
   - Log in with your Twitch account

2. **Register a New Application**
   - Click "Register Your Application"
   - Click "Register Application"

3. **Fill in Application Details**

   **Application Name:** NeuStream

   **OAuth Redirect URLs:**
   - Development: `http://localhost:3000/api/auth/twitch/callback`
   - Production: `https://api.neustream.app/api/auth/twitch/callback`

   **Category:** Website Integration

   **Client Type:** Confidential

4. **Get Your Client ID and Secret**
   - After creating the app, you'll see your **Client ID**
   - Click "New Secret" to generate your **Client Secret**
   - **Save these securely** - the secret is only shown once!

## Step 2: Configure Environment Variables

Add the following to your control plane `.env` file:

```bash
# Twitch OAuth Configuration
TWITCH_CLIENT_ID=your-twitch-client-id-here
TWITCH_CLIENT_SECRET=your-twitch-client-secret-here
TWITCH_CALLBACK_URL=https://api.neustream.app/api/auth/twitch/callback
```

For development, you can use:
```bash
TWITCH_CALLBACK_URL=http://localhost:3000/api/auth/twitch/callback
```

## Step 3: Verify Database Schema

Ensure your database has the OAuth fields. The migration should already be applied from Google OAuth setup:

```sql
-- Check if OAuth columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name LIKE 'oauth_%';
```

Expected columns:
- `oauth_provider` (varchar)
- `oauth_id` (varchar)
- `oauth_email` (varchar)
- `display_name` (varchar)
- `avatar_url` (varchar)

If missing, run the migration:
```bash
cd control-plane
node scripts/migrate-oauth.js
```

## Step 4: Test the Integration

1. **Start your control plane server:**
   ```bash
   cd control-plane
   npm start
   ```

2. **Navigate to your frontend auth page:**
   - Development: http://localhost:5173/auth
   - Production: https://www.neustream.app/auth

3. **Click "Continue with Twitch"**

4. **Authorize the application** when redirected to Twitch

5. **You should be redirected back** and logged in automatically

## Step 5: Troubleshooting

### Common Issues

1. **"Invalid client_id" error**
   - Verify your `TWITCH_CLIENT_ID` is correct
   - Ensure no extra spaces or quotes in the environment variable

2. **"Redirect URI mismatch" error**
   - Check that your callback URL in Twitch console matches exactly
   - Ensure HTTPS in production (Twitch requires HTTPS for production)

3. **User not created after authentication**
   - Check server logs for database errors
   - Verify database connection and OAuth schema
   - Ensure Twitch API is returning user data

4. **Avatar not showing**
   - Twitch avatars are handled automatically
   - Check browser console for image loading errors

### Debug Mode

Enable debug logging by setting in your control plane:
```bash
DEBUG=passport:*,oauth:*
```

## Step 6: Production Deployment

1. **Update callback URLs** in Twitch console to use HTTPS
2. **Set secure JWT_SECRET** in production environment
3. **Enable HTTPS** for your API endpoints
4. **Test the complete flow** in production environment

## OAuth Flow Details

The Twitch OAuth implementation follows this flow:

1. **User clicks "Continue with Twitch"**
2. **Redirected to Twitch authorization page**
3. **User authorizes your application**
4. **Twitch redirects back with authorization code**
5. **Server exchanges code for access token**
6. **Server fetches user profile from Twitch API**
7. **User account created/updated in database**
8. **JWT token generated and user redirected to frontend**

## Required Scopes

The implementation uses these Twitch OAuth scopes:
- `user:read:email` - Access to user's email address

## Security Considerations

- Store client secrets securely (never commit to version control)
- Use HTTPS in production for all OAuth flows
- Implement proper session management
- Validate all tokens server-side
- Monitor for suspicious authentication patterns

## User Experience Features

- **Account Linking**: Users with existing email/password accounts can link Twitch
- **Profile Sync**: Display name and avatar updated from Twitch profile
- **Multiple OAuth**: Users can authenticate with either Google or Twitch
- **Stream Key**: Automatically generated for new Twitch users

## API Endpoints

New Twitch OAuth endpoints:
- `GET /api/auth/twitch` - Initiate Twitch OAuth flow
- `GET /api/auth/twitch/callback` - Twitch OAuth callback handler

## Support

For issues with Twitch OAuth setup:
1. Check server logs in control plane
2. Verify environment variables are set correctly
3. Test with Twitch OAuth debugger tools
4. Review Twitch API documentation at https://dev.twitch.tv/docs/authentication/