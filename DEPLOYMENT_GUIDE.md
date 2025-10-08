# Neustream Deployment Guide

This guide documents the complete setup process for Neustream - a multi-platform streaming service deployed on Oracle Cloud Infrastructure (OCI) free tier.

## Architecture Overview

- **Control Plane** (129.154.252.216): API server, PostgreSQL database, nginx reverse proxy
- **Media Server** (140.245.17.113): nginx with RTMP module for live streaming
- **Frontend**: Deployed on Vercel
- **Domains**:
  - `neustream.app` & `api.neustream.app` → Control Plane
  - `stream.neustream.app` → Media Server

## Prerequisites

- Oracle Cloud Free Tier account
- Hostinger domain (neustream.app)
- GitHub repository with secrets configured

## GitHub Actions Secrets Required

### Control Plane
- `CONTROL_PLANE_HOST`: 129.154.252.216
- `CONTROL_PLANE_USERNAME`: ubuntu
- `CONTROL_PLANE_SSH_KEY`: SSH private key

### Media Server
- `MEDIA_SERVER_HOST`: 140.245.17.113
- `MEDIA_SERVER_USERNAME`: ubuntu
- `MEDIA_SERVER_SSH_KEY`: SSH private key

### General
- `API_DOMAIN`: api.neustream.app
- `STREAM_DOMAIN`: stream.neustream.app
- `VERCEL_TOKEN`: Vercel deployment token

## 1. Initial Setup Issues & Solutions

### Oracle Cloud Firewall Issues

**Problem**: Ports 80/443 not accessible despite OCI security rules
**Root Cause**: Local iptables firewall with `REJECT all` rule

**Solution**:
```bash
# On both control plane and media server
sudo iptables -F        # Flush all rules
sudo iptables -X        # Delete all chains
sudo iptables -P INPUT ACCEPT    # Set default policy to ACCEPT
```

### Database Connectivity

**Problem**: PostgreSQL connection failures
**Solution**: Use local PostgreSQL instead of external database

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE neustream;"
sudo -u postgres psql -c "CREATE USER neustream_user WITH PASSWORD '23k4j123k4ksdhfasiuhe';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE neustream TO neustream_user;"

# Allow local connections
echo "host    neustream     neustream_user     127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
```

## 2. Control Plane Setup

### SSL Certificate Configuration

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d neustream.app -d api.neustream.app --email farseenmanekhan1232@gmail.com --non-interactive --agree-tos

# Verify nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Nginx Configuration

**File**: `/etc/nginx/sites-available/neustream`

```nginx
server {
    listen 80;
    server_name neustream.app api.neustream.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name neustream.app api.neustream.app;

    ssl_certificate /etc/letsencrypt/live/neustream.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neustream.app/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Application Setup

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Setup application directory
sudo mkdir -p /opt/neustream
sudo chown ubuntu:ubuntu /opt/neustream
cd /opt/neustream

# Install dependencies
npm install --no-audit --no-fund

# Create environment file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neustream
DB_USER=neustream_user
DB_PASSWORD=23k4j123k4ksdhfasiuhe
PORT=3000
NODE_ENV=production
MEDIA_SERVER_HOST=140.245.17.113
STREAM_DOMAIN=stream.neustream.app
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Run migrations
npm run migrate

# Start with PM2
pm2 start server.js --name "neustream-control-plane"
pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## 3. Media Server Setup

### SSL Certificate Configuration

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d stream.neustream.app --email farseenmanekhan1232@gmail.com --non-interactive --agree-tos

# Verify nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Nginx with RTMP Configuration

**File**: `/etc/nginx/nginx.conf`

```nginx
# Load RTMP module
load_module /usr/lib/nginx/modules/ngx_rtmp_module.so;

worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name stream.neustream.app;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name stream.neustream.app;

    ssl_certificate /etc/letsencrypt/live/stream.neustream.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stream.neustream.app/privkey.pem;

    # Stats page
    location /stat {
        rtmp_stat all;
        rtmp_stat_stylesheet stat.xsl;
    }

    location /stat.xsl {
        root /usr/share/nginx/html;
    }

    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}

# RTMP configuration
rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        max_streams 10;
        ping 30s;
        ping_timeout 10s;

        application live {
            live on;
            record off;
            drop_idle_publisher 10s;

            # Authentication callback (must use HTTP, not HTTPS for RTMP)
            on_publish http://api.neustream.app/api/auth/stream;
            on_publish_done http://api.neustream.app/api/auth/stream-end;

            # Push to destinations based on user configuration
            # push rtmp://a.rtmp.youtube.com/live2/stream_key_here;
            # push rtmp://live.twitch.tv/app/stream_key_here;
            # push rtmp://live-api-s.facebook.com:80/rtmp/stream_key_here;
        }
    }
}
```

### Important RTMP Notes

- RTMP authentication URLs must use HTTP, not HTTPS
- RTMP server listens on port 1935
- Stream URL: `rtmp://stream.neustream.app/live`

## 4. Frontend Deployment

### Environment Configuration

**File**: `frontend/.env.production`

```
VITE_API_BASE=https://api.neustream.app/api
```

### Vercel Deployment

```bash
cd frontend
npm install -g vercel
vercel --prod --token $VERCEL_TOKEN --confirm
```

## 5. DNS Configuration (Hostinger)

### A Records
- `neustream.app` → 129.154.252.216
- `api.neustream.app` → 129.154.252.216
- `stream.neustream.app` → 140.245.17.113

### CNAME Records (if using subdomains)
- `www.neustream.app` → `neustream.app`

## 6. GitHub Actions Workflow

### Key Features
- Manual trigger only (`workflow_dispatch`)
- Parallel setup of control plane and media server
- Automated SSL certificate installation
- Database migrations
- PM2 process management
- Vercel frontend deployment

### Workflow Steps
1. **Initial Setup Workflow** (`deploy.yml`):
   - Manual trigger only (`workflow_dispatch`)
   - Complete server setup from scratch
   - Install all dependencies and services
   - Configure SSL certificates
   - Run initial database migrations

2. **CI/CD Workflow** (`ci-cd.yml`):
   - Automatic trigger on push to main
   - Run tests first
   - Deploy to control plane (app restart + migrations)
   - Deploy to media server (nginx reload)
   - Deploy frontend to Vercel

## 7. Testing & Verification

### Control Plane Health Check
```bash
curl -I https://api.neustream.app/health
curl -I https://neustream.app/health
```

### Media Server Health Check
```bash
curl -I https://stream.neustream.app/health
```

### RTMP Streaming Test
```bash
# Test RTMP connection
telnet stream.neustream.app 1935

# View RTMP statistics
curl http://stream.neustream.app/stat
```

## 8. Troubleshooting

### Common Issues

1. **Ports not accessible**
   - Check OCI security rules
   - Disable local iptables firewall
   - Verify nginx is running

2. **SSL certificate errors**
   - Verify DNS records are propagated
   - Check Certbot logs: `sudo journalctl -u certbot`
   - Renew certificates: `sudo certbot renew`

3. **RTMP authentication failures**
   - Ensure RTMP URLs use HTTP, not HTTPS
   - Verify control plane API is accessible
   - Check nginx error logs

4. **Database connection issues**
   - Verify PostgreSQL is running
   - Check connection string in .env file
   - Test local connectivity

### Log Locations
- **Nginx**: `/var/log/nginx/error.log`
- **PM2**: `pm2 logs neustream-control-plane`
- **PostgreSQL**: `/var/log/postgresql/postgresql-*.log`

## 9. Maintenance

### SSL Certificate Renewal
```bash
# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Application Updates
1. Push code to GitHub
2. Run GitHub Actions deployment workflow
3. Verify all services are healthy

### Backup Strategy
- Database: PostgreSQL dumps
- Application: Git repository
- Configuration: Documented in this guide

## 10. Security Considerations

- Firewall rules properly configured
- SSL certificates for all domains
- Secure database passwords
- JWT secret generation
- Regular security updates

## Success Metrics

- ✅ Control Plane accessible via HTTPS
- ✅ Media Server accessible via HTTPS
- ✅ RTMP streaming functional
- ✅ Frontend deployed with secure API endpoints
- ✅ Database migrations completed
- ✅ PM2 process management working

This deployment setup provides a fully functional multi-platform streaming service on Oracle Cloud free tier with proper SSL encryption and automated deployment workflows.