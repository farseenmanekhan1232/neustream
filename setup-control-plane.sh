#!/bin/bash

# Setup script for Control Plane instance (Oracle Linux)

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL
sudo yum install -y postgresql postgresql-server
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE neustream;"
sudo -u postgres psql -c "CREATE USER neustream_user WITH PASSWORD 'your_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE neustream TO neustream_user;"

# Install PM2 for process management
sudo npm install -g pm2

# Install Redis
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis

# Create app directory
sudo mkdir -p /opt/neustream
sudo chown $USER:$USER /opt/neustream

# Clone repository (run this manually after setup)
echo "Setup complete. Now clone your repository:"
echo "cd /opt/neustream && git clone <your-repo-url> ."
echo "Then configure .env file and run: npm run migrate"