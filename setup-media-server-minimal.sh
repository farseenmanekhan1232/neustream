#!/bin/bash

# Minimal setup script for Media Server instance (Oracle Linux)
# Avoids memory-intensive operations for 1GB RAM instances

echo "🔧 Setting up Media Server (minimal approach)..."

# Skip system updates - they consume too much memory
# sudo yum update -y --skip-broken

# Install git first (required for cloning)
echo "📦 Installing git..."
sudo yum install -y git --skip-broken

# Install nginx with RTMP module using minimal approach
echo "📦 Installing nginx with RTMP..."
sudo yum install -y epel-release --skip-broken
sudo yum install -y nginx nginx-mod-rtmp --skip-broken

# Configure firewall
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-port=1935/tcp 2>/dev/null || echo "FirewallD not available, continuing..."
sudo firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || echo "FirewallD not available, continuing..."
sudo firewall-cmd --reload 2>/dev/null || echo "FirewallD reload failed, continuing..."

# Create app directory
sudo mkdir -p /opt/neustream
sudo chown $USER:$USER /opt/neustream

# Clone repository
echo "📥 Cloning repository..."
cd /opt/neustream
git clone https://github.com/farseenmanekhan1232/neustream .

# Update nginx config with control plane IP
echo "⚙️  Configuring nginx..."
if [ -f "nginx-rtmp.conf" ]; then
    # Replace placeholder with actual IP
    CONTROL_PLANE_IP="YOUR_CONTROL_PLANE_IP_HERE"
    if [ "$CONTROL_PLANE_IP" != "YOUR_CONTROL_PLANE_IP_HERE" ]; then
        sed -i "s/CONTROL_PLANE_IP_HERE/$CONTROL_PLANE_IP/g" nginx-rtmp.conf
    fi

    # Deploy nginx config
    sudo cp nginx-rtmp.conf /etc/nginx/nginx.conf
    sudo nginx -t && sudo systemctl restart nginx
    sudo systemctl enable nginx
else
    echo "❌ nginx-rtmp.conf not found!"
    echo "Creating basic nginx config..."

    # Create basic nginx config
    sudo cat > /etc/nginx/nginx.conf << 'NGINXEOF'
worker_processes 1;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

rtmp_auto_push on;

rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record off;
            # Authentication will be added later
        }
    }
}

http {
    server {
        listen 80;
        location /health {
            return 200 'ok';
            add_header Content-Type text/plain;
        }
    }
}
NGINXEOF

    sudo nginx -t && sudo systemctl restart nginx
    sudo systemctl enable nginx
fi

echo ""
echo "✅ Media Server setup complete!"
echo "📡 RTMP endpoint: rtmp://$(curl -s ifconfig.me)/live"
echo "🔍 Check status: sudo systemctl status nginx"
echo "📝 View logs: sudo journalctl -u nginx -f"
echo ""
echo "⚠️  IMPORTANT: Update nginx config with your Control Plane IP:"
echo "   Edit /etc/nginx/nginx.conf and replace CONTROL_PLANE_IP_HERE"