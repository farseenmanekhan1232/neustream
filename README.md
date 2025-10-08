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

- [ ] Implement proper user authentication
- [ ] Add stream monitoring dashboard
- [ ] Implement dynamic nginx configuration
- [ ] Add transcoding support
- [ ] Implement billing system