# 🚀 Automated Setup Guide for Ubuntu 20.04

## 🎯 Recommended Approach

Use **GitHub Actions** for complete automation - no manual setup required!

## 📋 Prerequisites

- 2x Ubuntu 20.04 instances (1GB RAM each)
- PostgreSQL database (external)
- GitHub repository with secrets configured

## 🔧 Step 1: Configure GitHub Secrets

Make sure these secrets are set in your GitHub repository:

### Control Plane Secrets
- `CONTROL_PLANE_HOST` - IP address of control plane instance
- `CONTROL_PLANE_USERNAME` - SSH username (usually `ubuntu`)
- `CONTROL_PLANE_SSH_KEY` - SSH private key

### Media Server Secrets
- `MEDIA_SERVER_HOST` - IP address of media server instance
- `MEDIA_SERVER_USERNAME` - SSH username (usually `ubuntu`)
- `MEDIA_SERVER_SSH_KEY` - SSH private key

### Database Secrets
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

### Frontend Secrets
- `VERCEL_TOKEN` - Vercel deployment token

## 🚀 Step 2: Run Automated Setup

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Find **"Deploy Neustream (Initial Setup)"** workflow
4. Click **"Run workflow"**
5. Wait for all jobs to complete

## ✅ What Gets Installed Automatically

### Control Plane
- Node.js 18
- PM2 process manager
- Application code from repository
- PostgreSQL database connection
- Environment configuration
- Database migrations
- Auto-start on boot

### Media Server
- nginx with RTMP module
- Firewall configuration (ports 1935, 80)
- Application code from repository
- nginx configuration with control plane integration
- Auto-start on boot

### Frontend
- Vercel deployment
- Production environment variables

## 🔄 Future Updates

### Health Monitoring
- **Health Check** workflow runs every 6 hours
- Monitors both control plane and media server

## 🧪 Step 3: Verification

### Test Control Plane
```bash
curl http://CONTROL_PLANE_IP:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Media Server
```bash
curl http://MEDIA_SERVER_IP/health
# Should return: ok
```

### Test API Registration
```bash
curl -X POST http://CONTROL_PLANE_IP:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@neustream.com","password":"test123"}'
```

## 🎯 Step 4: Configure OBS

- **Server**: `rtmp://MEDIA_SERVER_IP/live`
- **Stream Key**: Use the key from registration response

## 🚨 Troubleshooting

### GitHub Actions Issues
- **SSH connection fails**: Check SSH keys and host accessibility
- **Database connection fails**: Verify PostgreSQL credentials and network access
- **Service startup fails**: Check logs in GitHub Actions output

### Instance Issues
- **Port 3000 not accessible**: Check security groups/firewall
- **nginx fails**: Check config with `sudo nginx -t`
- **Service not starting**: Check logs with `pm2 logs`

## 📁 GitHub Actions Workflows

- `deploy.yml` - Initial setup (manual trigger)
- `health-check.yml` - Health monitoring (every 6 hours)