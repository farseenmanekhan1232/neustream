# Neustream - Multi-Platform Streaming MVP

A cost-effective multi-destination streaming service built for Oracle Cloud free tier.

## Architecture

- **Control Plane**: Node.js API + PostgreSQL + Redis (1 instance)
- **Media Server**: nginx-rtmp + FFmpeg relay (1 instance)
- **Frontend**: React dashboard (Vercel deployment)

## Quick Setup

### 1. Oracle Cloud Instance Setup

**Control Plane Instance:**
```bash
# Run setup script
chmod +x setup-control-plane.sh
./setup-control-plane.sh

# Clone repo
cd /opt/neustream
git clone <your-repo> .

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Install dependencies & run migrations
npm install
npm run migrate

# Start service
pm2 start server.js --name "neustream-control-plane"
pm2 save
```

**Media Server Instance:**
```bash
# Run setup script
chmod +x setup-media-server.sh
./setup-media-server.sh

# Clone repo
cd /opt/neustream
git clone <your-repo> .

# Configure nginx
sudo cp nginx-rtmp.conf /etc/nginx/nginx.conf
# Edit nginx.conf with your control plane host

# Restart nginx
sudo nginx -t && sudo systemctl restart nginx
```

### 2. GitHub Secrets Setup

Add these secrets to your GitHub repository:
- `CONTROL_PLANE_HOST` - IP of control plane instance
- `CONTROL_PLANE_USERNAME` - SSH username
- `CONTROL_PLANE_SSH_KEY` - SSH private key
- `MEDIA_SERVER_HOST` - IP of media server instance
- `MEDIA_SERVER_USERNAME` - SSH username
- `MEDIA_SERVER_SSH_KEY` - SSH private key
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- `VERCEL_TOKEN` - For frontend deployment

### 3. Frontend Deployment

```bash
cd frontend
npm install
npm run build
# Deploy to Vercel using the VERCEL_TOKEN
```

## Usage

1. **User Registration**: Users register via the dashboard
2. **Stream Setup**: Each user gets a unique stream key
3. **Destination Management**: Add YouTube, Twitch, Facebook RTMP endpoints
4. **OBS Configuration**: Use the provided RTMP URL and stream key
5. **Start Streaming**: Stream is relayed to all enabled destinations

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/stream` - Stream authentication (nginx callback)
- `GET /api/streams/info` - Get stream configuration
- `GET /api/destinations` - List user destinations
- `POST /api/destinations` - Add destination
- `DELETE /api/destinations/:id` - Remove destination

## Capacity

- Supports 2 concurrent streams
- 3 destinations per stream
- Oracle Cloud free tier bandwidth (10TB/month)
- Zero infrastructure costs

## Next Steps

- [x] **Implement Google OAuth authentication** ✅ NEW
- [ ] Add stream monitoring dashboard
- [ ] Implement dynamic nginx configuration
- [ ] Add transcoding support
- [ ] Implement billing system

## Google OAuth Setup

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://api.neustream.app/api/auth/google/callback` (production)
   - `http://localhost:3000/api/auth/google/callback` (development)
6. Copy the Client ID and Client Secret

### 2. Environment Variables for Google OAuth

Add these to your GitHub Secrets for deployment:
- `SESSION_SECRET` - Secure session encryption key
- `JWT_SECRET` - JWT token signing secret
- `FRONTEND_URL` - Your frontend URL (e.g., `https://neustream.app`)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GOOGLE_CALLBACK_URL` - OAuth callback URL

### 3. Database Migration

Run the OAuth migration to add Google auth support:
```bash
node scripts/migrate-oauth.js
```

This adds:
- `oauth_provider`, `oauth_id`, `oauth_email` columns to users table
- `display_name`, `avatar_url` for Google profile data
- Support for users without passwords (OAuth-only)

## Authentication Flow

### Email/Password Authentication
- Traditional registration/login with bcrypt password hashing
- Each user gets a unique stream key for RTMP authentication

### Google OAuth Authentication
- One-click sign-in with Google account
- Automatic account creation for new users
- Account linking for existing email/password users
- Profile information sync from Google
- JWT-based session management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/validate-token` - Validate JWT token

### Streams
- `POST /api/auth/stream` - RTMP stream authentication (nginx callback)
- `POST /api/auth/stream-end` - Stream end callback
- `GET /api/streams/info` - Get stream configuration

### Destinations
- `GET /api/destinations` - Get user's streaming destinations
- `POST /api/destinations` - Add new streaming destination
- `PUT /api/destinations/:id` - Update destination
- `DELETE /api/destinations/:id` - Delete destination
