#!/bin/bash

# Optimized setup script for Control Plane instance (Oracle Linux)
# Designed for VM.Standard.E2.1.Micro (1GB RAM)

echo "🔧 Setting up Control Plane for Oracle Cloud free tier..."

# Update system (minimal updates)
sudo yum update -y --skip-broken

# Install git first (required for cloning)
echo "📦 Installing git..."
sudo yum install -y git

# Install Node.js 18 (using Oracle Linux repos for stability)
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /opt/neustream
sudo chown $USER:$USER /opt/neustream

# Clone repository
echo "📥 Cloning repository..."
cd /opt/neustream
git clone https://github.com/farseenmanekhan1232/neustream .

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

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
pm2 startup

echo ""
echo "✅ Control Plane setup complete!"
echo "📊 Service running on: http://$(curl -s ifconfig.me):3000"
echo "🔍 Check status: pm2 status"
echo "📝 View logs: pm2 logs neustream-control-plane"