#!/bin/bash

# Minimal setup script for Control Plane instance (Oracle Linux)
# Avoids memory-intensive operations for 1GB RAM instances

echo "🔧 Setting up Control Plane (minimal approach)..."

# Skip system updates - they consume too much memory
# sudo yum update -y --skip-broken

# Install git first (required for cloning)
echo "📦 Installing git..."
sudo yum install -y git --skip-broken

# Install Node.js 18 using minimal approach
echo "📦 Installing Node.js..."
# Use Oracle Linux repos directly to avoid memory issues
sudo yum install -y oracle-nodejs-release-el8
sudo yum install -y nodejs --skip-broken

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2 --no-audit --no-fund

# Create app directory
sudo mkdir -p /opt/neustream
sudo chown $USER:$USER /opt/neustream

# Clone repository
echo "📥 Cloning repository..."
cd /opt/neustream
git clone https://github.com/farseenmanekhan1232/neustream .

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --no-audit --no-fund

# Create optimized environment file
cat > .env << EOF
DB_TYPE=sqlite
DB_PATH=/opt/neustream/data/neustream.db
PORT=3000
NODE_ENV=production
MEDIA_SERVER_HOST=YOUR_MEDIA_SERVER_IP_HERE
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Create data directory for SQLite
mkdir -p /opt/neustream/data

# Run database migrations
echo "🗄️ Setting up database..."
npm run migrate

# Start service with PM2
echo "🚀 Starting Control Plane service..."
pm2 start server.js --name "neustream-control-plane"
pm2 save

# Create startup script (avoid pm2 startup which can fail)
cat > /opt/neustream/start.sh << 'EOF'
#!/bin/bash
cd /opt/neustream
pm2 resurrect
EOF
chmod +x /opt/neustream/start.sh

echo ""
echo "✅ Control Plane setup complete!"
echo "📊 Service running on: http://$(curl -s ifconfig.me):3000"
echo "🔍 Check status: pm2 status"
echo "📝 View logs: pm2 logs neustream-control-plane"
echo ""
echo "⚠️  To start on boot, add to crontab:"
echo "@reboot /opt/neustream/start.sh"