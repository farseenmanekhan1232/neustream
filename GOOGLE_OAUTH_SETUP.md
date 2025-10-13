# Google OAuth Implementation Guide

This guide documents the complete Google OAuth implementation for NeuStream, including setup instructions and technical details.

## 🚀 What's Been Implemented

### ✅ Backend (Control Plane)
- **Google OAuth Strategy**: Complete Passport.js Google OAuth 2.0 integration
- **JWT Token Management**: Secure token generation and validation
- **Account Linking**: Automatic linking of Google accounts to existing email users
- **Database Schema**: OAuth-ready user table with support for social logins
- **API Endpoints**: Complete OAuth flow endpoints
- **Session Management**: Express session with secure configuration

### ✅ Frontend (React App)
- **Modern Auth Context**: React Context-based authentication state management
- **Google Sign-In Button**: Professional UI with Google branding
- **Protected Routes**: Route-level authentication guards
- **JWT Token Handling**: Automatic token management and API integration
- **User Profile Display**: Avatar and display name support from Google
- **Error Handling**: Comprehensive error states and user feedback

### ✅ DevOps & Deployment
- **GitHub Actions**: Updated CI/CD pipeline with OAuth environment variables
- **Database Migrations**: Automated OAuth schema migration
- **Environment Configuration**: Complete environment variable setup

## 📋 Setup Instructions

### 1. Google Cloud Console Setup

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://api.neustream.app/api/auth/google/callback` (production)
     - `http://localhost:3000/api/auth/google/callback` (development)
   - Copy the Client ID and Client Secret

2. **Enable Required APIs**:
   - Enable "Google+ API" or "People API"
   - Enable "Google OAuth2 API"

### 2. Environment Variables

Add these to your GitHub repository secrets:

```bash
# Authentication Secrets
SESSION_SECRET=your-super-secure-session-secret
JWT_SECRET=your-jwt-signing-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.neustream.app/api/auth/google/callback

# Application URLs
FRONTEND_URL=https://www.neustream.app
```

### 3. Database Migration

The OAuth migration script automatically runs during deployment. To run manually:

```bash
cd control-plane
node scripts/migrate-oauth.js
```

This adds:
- `oauth_provider` (VARCHAR): Social provider name (google)
- `oauth_id` (VARCHAR): Provider's user ID
- `oauth_email` (VARCHAR): Email from OAuth provider
- `display_name` (VARCHAR): User's display name
- `avatar_url` (TEXT): Profile picture URL
- Makes `password_hash` nullable for OAuth users

## 🔧 Technical Architecture

### Authentication Flow

1. **User Clicks Google Sign-In** → Redirects to `/api/auth/google`
2. **Google OAuth Consent** → User authorizes the application
3. **Callback Handling** → `/api/auth/google/callback` processes response
4. **Account Creation/Linking** → System creates new user or links to existing
5. **JWT Generation** → Secure token generated for session management
6. **Frontend Redirect** → Redirects to dashboard with user data

### Database Schema

```sql
-- Users table now supports OAuth
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT, -- Nullable for OAuth users
  stream_key VARCHAR(255) UNIQUE NOT NULL,
  oauth_provider VARCHAR(50), -- 'google', 'github', etc.
  oauth_id VARCHAR(255), -- Provider's user ID
  oauth_email VARCHAR(255), -- Email from OAuth provider
  display_name VARCHAR(255), -- User's display name
  avatar_url TEXT, -- Profile picture URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint for OAuth users
CREATE UNIQUE INDEX idx_users_oauth
ON users(oauth_provider, oauth_id)
WHERE oauth_provider IS NOT NULL;
```

### API Endpoints

#### Authentication
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google callback
- `POST /api/auth/validate-token` - Validate JWT token
- `POST /api/auth/login` - Traditional email/password login
- `POST /api/auth/register` - Traditional registration

#### User Management
- `GET /api/users/me` - Get current user (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Frontend Components

#### AuthContext (`src/contexts/AuthContext.jsx`)
- Global authentication state management
- Automatic session restoration
- Google OAuth callback handling
- User profile updates

#### Auth Service (`src/services/auth.js`)
- API communication layer
- JWT token management
- Request/response interceptors
- Error handling and automatic logout

#### ProtectedRoute (`src/components/ProtectedRoute.jsx`)
- Route-level authentication guards
- Loading states during auth check
- Automatic redirects for unauthorized access
- Support for both authenticated and unauthenticated routes

#### Auth Page (`src/pages/Auth.jsx`)
- Modern, responsive authentication UI
- Google Sign-In button with proper branding
- Email/password forms with validation
- Error handling and user feedback
- Toggle between login/register modes

## 🎨 UI/UX Features

### Google Sign-In Button
- Official Google branding and colors
- Professional SVG icon
- Consistent with Google's design guidelines
- Responsive and accessible

### User Profile Display
- Avatar support from Google profile
- Display name integration
- OAuth provider identification
- Fallback to email initials

### Error Handling
- Comprehensive error states
- User-friendly error messages
- Form validation feedback
- Network error handling

## 🔒 Security Features

### JWT Token Management
- Secure token generation with expiration
- Automatic token validation
- Token refresh mechanism
- Secure storage in localStorage

### Session Security
- HTTP-only cookies in production
- CSRF protection ready
- Secure session configuration
- Automatic session cleanup

### OAuth Security
- State parameter validation
- PKCE support ready
- Secure redirect URI validation
- Scope limitation

## 🧪 Testing

### Manual Testing Checklist
- [ ] Google Sign-In button appears and functions
- [ ] OAuth flow completes successfully
- [ ] New user accounts are created automatically
- [ ] Existing email accounts link properly
- [ ] JWT tokens are generated and validated
- [ ] Protected routes require authentication
- [ ] User profile displays correctly
- [ ] Logout functionality works
- [ ] Error states display appropriately
- [ ] Mobile responsive design

### API Testing
```bash
# Test Google OAuth endpoint
curl -I https://api.neustream.app/api/auth/google

# Test token validation
curl -X POST https://api.neustream.app/api/auth/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "your-jwt-token"}'
```

## 🚀 Deployment

### Automatic Deployment
The GitHub Actions workflow automatically:
1. Installs OAuth dependencies
2. Runs database migrations
3. Sets up environment variables
4. Deploys to production

### Manual Deployment Steps
```bash
# 1. Update control plane
cd control-plane
npm install
npm run migrate
node scripts/migrate-oauth.js

# 2. Update environment variables
echo "GOOGLE_CLIENT_ID=your-client-id" >> .env
echo "GOOGLE_CLIENT_SECRET=your-client-secret" >> .env

# 3. Restart services
pm2 restart neustream-control-plane
```

## 🐛 Troubleshooting

### Common Issues

1. **Google OAuth Redirect Mismatch**
   - Ensure redirect URIs match exactly in Google Console
   - Check protocol (http vs https)
   - Verify domain configuration

2. **Token Validation Failures**
   - Check JWT_SECRET environment variable
   - Verify token expiration settings
   - Ensure proper token format

3. **Database Migration Issues**
   - Run migration script manually
   - Check PostgreSQL connection
   - Verify table permissions

4. **Frontend Build Errors**
   - Check for missing dependencies
   - Verify import paths
   - Run `npm install` in frontend directory

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=neustream:* npm start
```

## 📈 Next Steps

### Phase 2 Enhancements
- [ ] **Multi-Provider OAuth**: Add GitHub, Twitter, Facebook
- [ ] **Account Linking UI**: Allow users to link multiple accounts
- [ ] **Two-Factor Authentication**: TOTP/SMS support
- [ ] **Password Reset**: Email-based password recovery
- [ ] **Email Verification**: Confirm email addresses

### Advanced Features
- [ ] **Role-Based Access Control**: Admin, moderator roles
- [ ] **API Rate Limiting**: Prevent abuse
- [ ] **Session Analytics**: Track user sessions
- [ ] **Security Monitoring**: Failed login alerts

## 📚 References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](https://github.com/jaredhanson/passport-google-oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [React Context API](https://react.dev/reference/react/createContext)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the GitHub Actions logs
3. Check application logs: `pm2 logs neustream-control-plane`
4. Open an issue in the repository

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready