#!/bin/bash

# Optimized setup script for Media Server instance (Oracle Linux)
# Designed for VM.Standard.E2.1.Micro (1GB RAM)

echo "🔧 Setting up Media Server for Oracle Cloud free tier..."

# Update system (minimal updates)
sudo yum update -y --skip-broken

# Install git first (required for cloning)
echo "📦 Installing git..."
sudo yum install -y git

# Install nginx with RTMP module
echo "📦 Installing nginx with RTMP..."
sudo yum install -y epel-release
sudo yum install -y nginx nginx-mod-rtmp

# Configure firewall
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-port=1935/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload

# Create app directory
sudo mkdir -p /opt/neustream
sudo chown $USER:$USER /opt/neustream

# Clone repository
echo "📥 Cloning repository..."
cd /opt/neustream
git clone https://github.com/farseenmanekhan1232/neustream .

# Update nginx config with control plane IP (replace manually)
echo "⚠️  Please update CONTROL_PLANE_IP_HERE in nginx-rtmp.conf with your control plane IP"
echo "   Then run: sudo cp nginx-rtmp.conf /etc/nginx/nginx.conf"

# Start nginx
echo "🚀 Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "✅ Media Server setup complete!"
echo "📡 RTMP endpoint: rtmp://$(curl -s ifconfig.me)/live"
echo "🔍 Check status: sudo systemctl status nginx"
echo "📝 View logs: sudo journalctl -u nginx -f"