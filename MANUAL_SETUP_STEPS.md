# 🔧 Manual Setup Steps (Command by Command)

## ⚠️ For Oracle Cloud Free Tier (1GB RAM)

Run these commands **one by one** on each instance. Don't run them all at once.

---

## 🖥️ Control Plane Instance

### Step 1: Install git
```bash
sudo yum install -y git --skip-broken
```

### Step 2: Install Node.js
```bash
sudo yum install -y oracle-nodejs-release-el8
sudo yum install -y nodejs --skip-broken
```

### Step 3: Install PM2
```bash
sudo npm install -g pm2 --no-audit --no-fund
```

### Step 4: Setup app directory
```bash
sudo mkdir -p /opt/neustream
sudo chown opc:opc /opt/neustream
cd /opt/neustream
```

### Step 5: Clone repository
```bash
git clone https://github.com/farseenmanekhan1232/neustream .
```

### Step 6: Install dependencies
```bash
npm install --no-audit --no-fund
```

### Step 7: Create environment file
```bash
cat > .env << 'EOF'
DB_TYPE=sqlite
DB_PATH=/opt/neustream/data/neustream.db
PORT=3000
NODE_ENV=production
MEDIA_SERVER_HOST=YOUR_MEDIA_SERVER_IP
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### Step 8: Create data directory
```bash
mkdir -p data
```

### Step 9: Run migrations
```bash
npm run migrate
```

### Step 10: Start service
```bash
pm2 start server.js --name "neustream-control-plane"
pm2 save
```

---

## 📡 Media Server Instance

### Step 1: Install git
```bash
sudo yum install -y git --skip-broken
```

### Step 2: Install nginx with RTMP
```bash
sudo yum install -y epel-release --skip-broken
sudo yum install -y nginx nginx-mod-rtmp --skip-broken
```

### Step 3: Setup app directory
```bash
sudo mkdir -p /opt/neustream
sudo chown opc:opc /opt/neustream
cd /opt/neustream
```

### Step 4: Clone repository
```bash
git clone https://github.com/farseenmanekhan1232/neustream .
```

### Step 5: Configure nginx
```bash
# Replace CONTROL_PLANE_IP_HERE with your actual control plane IP
CONTROL_PLANE_IP="YOUR_CONTROL_PLANE_IP_HERE"
sed -i "s/CONTROL_PLANE_IP_HERE/$CONTROL_PLANE_IP/g" nginx-rtmp.conf
```

### Step 6: Deploy nginx config
```bash
sudo cp nginx-rtmp.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## ✅ Verification

### Test Control Plane
```bash
curl http://CONTROL_PLANE_IP:3000/health
```

### Test Media Server
```bash
curl http://MEDIA_SERVER_IP/health
```

### Test Registration
```bash
curl -X POST http://CONTROL_PLANE_IP:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@neustream.com","password":"test123"}'
```

---

## 🚨 Troubleshooting

If any command fails:
- **Memory issues**: Wait 30 seconds between commands
- **Package not found**: Try without `--skip-broken`
- **Service not starting**: Check logs with `pm2 logs` or `sudo journalctl -u nginx`
- **Port issues**: Check Oracle Cloud security lists

## 🔄 Auto-start on boot

### Control Plane:
```bash
echo "@reboot cd /opt/neustream && pm2 resurrect" | crontab -
```

### Media Server:
```bash
sudo systemctl enable nginx
```