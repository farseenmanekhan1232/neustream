#!/bin/bash

# Setup script for Media Server instance (Oracle Linux)

# Update system
sudo yum update -y

# Install nginx with RTMP module
sudo yum install -y epel-release
sudo yum install -y nginx nginx-mod-rtmp

# Install FFmpeg
sudo yum install -y ffmpeg

# Configure firewall
sudo firewall-cmd --permanent --add-port=1935/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# Create app directory
sudo mkdir -p /opt/neustream
sudo chown $USER:$USER /opt/neustream

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "Media server setup complete."
echo "Configure nginx-rtmp.conf and place it in /etc/nginx/nginx.conf"