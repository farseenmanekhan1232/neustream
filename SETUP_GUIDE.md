# 🚀 Manual Setup Guide for Oracle Cloud Free Tier

## ⚠️ Important: Memory Constraints

**Oracle Cloud Free Tier has only 1GB RAM per instance.**
- `yum update` gets killed due to memory limits
- Use minimal setup scripts that avoid system updates
- Run commands one by one with pauses between

## 🎯 Recommended Approach

Use the **minimal setup scripts** or follow the **step-by-step manual commands** from `MANUAL_SETUP_STEPS.md`

## 📋 Prerequisites

- 2x Oracle Cloud VM.Standard.E2.1.Micro instances (1GB RAM each)
- SSH access to both instances
- GitHub repository with code

## 🔧 Step 1: Control Plane Setup

### SSH to Control Plane Instance
```bash
ssh opc@CONTROL_PLANE_IP
```

### Run Minimal Setup (Recommended)
```bash
# Download and run the minimal setup script
curl -O https://raw.githubusercontent.com/farseenmanekhan1232/neustream/main/setup-control-plane-minimal.sh
chmod +x setup-control-plane-minimal.sh
./setup-control-plane-minimal.sh
```

**OR** use the step-by-step manual approach from `MANUAL_SETUP_STEPS.md`

### Manual Steps (if script fails)
```bash
# Install git
sudo yum install -y git

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repo
sudo mkdir -p /opt/neustream
sudo chown opc:opc /opt/neustream
cd /opt/neustream
git clone https://github.com/farseenmanekhan1232/neustream .

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DB_TYPE=sqlite
DB_PATH=/opt/neustream/data/neustream.db
PORT=3000
NODE_ENV=production
MEDIA_SERVER_HOST=YOUR_MEDIA_SERVER_IP
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Create data directory
mkdir -p data

# Run migrations
npm run migrate

# Start service
pm2 start server.js --name "neustream-control-plane"
pm2 save
pm2 startup
```

## 📡 Step 2: Media Server Setup

### SSH to Media Server Instance
```bash
ssh opc@MEDIA_SERVER_IP
```

### Run Minimal Setup (Recommended)
```bash
# Download and run the minimal setup script
curl -O https://raw.githubusercontent.com/farseenmanekhan1232/neustream/main/setup-media-server-minimal.sh
chmod +x setup-media-server-minimal.sh
./setup-media-server-minimal.sh
```

**OR** use the step-by-step manual approach from `MANUAL_SETUP_STEPS.md`

### Manual Steps (if script fails)
```bash
# Install git
sudo yum install -y git

# Install nginx with RTMP
sudo yum install -y epel-release
sudo yum install -y nginx nginx-mod-rtmp

# Configure firewall
sudo firewall-cmd --permanent --add-port=1935/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload

# Clone repo
sudo mkdir -p /opt/neustream
sudo chown opc:opc /opt/neustream
cd /opt/neustream
git clone https://github.com/farseenmanekhan1232/neustream .

# Update nginx config with control plane IP
sed -i "s/CONTROL_PLANE_IP_HERE/YOUR_CONTROL_PLANE_IP/g" nginx-rtmp.conf

# Deploy nginx config
sudo cp nginx-rtmp.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## ✅ Step 3: Verification

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

### Test API
```bash
curl -X POST http://CONTROL_PLANE_IP:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@neustream.com","password":"test123"}'
```

## 🎯 Step 4: Configure OBS

- **Server**: `rtmp://MEDIA_SERVER_IP/live`
- **Stream Key**: Use the key from registration response

## 🔄 Future Updates

### Manual Updates
```bash
cd /opt/neustream
git pull origin main
npm install
npm run migrate
pm2 restart neustream-control-plane
```

### GitHub Actions Updates
After manual setup, GitHub Actions will handle updates automatically:

1. **Initial Setup**: Run "Deploy Neustream (Initial Setup)" workflow manually once
2. **Automatic Updates**: "Update Neustream" workflow runs on every push to main
3. **Health Checks**: "Health Check" workflow runs every 6 hours

### GitHub Actions Workflows:
- `deploy.yml` - Initial setup (manual trigger)
- `update.yml` - Automatic updates (on push to main)
- `health-check.yml` - Health monitoring (every 6 hours)

## 🚨 Troubleshooting

- **Port 3000 not accessible**: Check Oracle Cloud security lists
- **nginx fails**: Check config with `sudo nginx -t`
- **Service not starting**: Check logs with `pm2 logs`
- **Database issues**: Check `/opt/neustream/data/neustream.db` permissions