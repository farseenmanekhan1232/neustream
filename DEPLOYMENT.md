# Deployment Checklist

## Phase 1: Oracle Cloud Instance Setup

### Control Plane Instance
1. **SSH into control plane instance**
   ```bash
   ssh opc@CONTROL_PLANE_HOST
   ```

2. **Run setup script**
   ```bash
   chmod +x setup-control-plane.sh
   ./setup-control-plane.sh
   ```

3. **Configure PostgreSQL password**
   ```bash
   sudo -u postgres psql -c "ALTER USER neustream_user WITH PASSWORD 'your_secure_password';"
   ```

4. **Clone repository**
   ```bash
   cd /opt/neustream
   git clone https://github.com/your-username/neustream .
   ```

5. **Configure environment**
   ```bash
   cp .env .env.local
   nano .env.local
   # Update with your actual passwords and IPs
   ```

6. **Install dependencies & run migrations**
   ```bash
   npm install
   npm run migrate
   ```

7. **Start service**
   ```bash
   pm2 start server.js --name "neustream-control-plane"
   pm2 save
   pm2 startup
   ```

### Media Server Instance
1. **SSH into media server instance**
   ```bash
   ssh opc@MEDIA_SERVER_HOST
   ```

2. **Run setup script**
   ```bash
   chmod +x setup-media-server.sh
   ./setup-media-server.sh
   ```

3. **Clone repository**
   ```bash
   cd /opt/neustream
   git clone https://github.com/your-username/neustream .
   ```

4. **Update nginx config with control plane IP**
   ```bash
   sudo cp nginx-rtmp.conf /etc/nginx/nginx.conf
   sudo nano /etc/nginx/nginx.conf
   # Replace ${CONTROL_PLANE_HOST} with actual IP
   ```

5. **Test and restart nginx**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Phase 2: GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `CONTROL_PLANE_HOST` - IP address of control plane instance
- `CONTROL_PLANE_USERNAME` - SSH username (usually `opc`)
- `CONTROL_PLANE_SSH_KEY` - SSH private key for control plane
- `MEDIA_SERVER_HOST` - IP address of media server instance
- `MEDIA_SERVER_USERNAME` - SSH username (usually `opc`)
- `MEDIA_SERVER_SSH_KEY` - SSH private key for media server
- `DB_HOST` - `localhost`
- `DB_NAME` - `neustream`
- `DB_USER` - `neustream_user`
- `DB_PASSWORD` - Your PostgreSQL password
- `DB_PORT` - `5432`
- `VERCEL_TOKEN` - For frontend deployment (optional)

## Phase 3: Test Deployment

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Initial MVP deployment"
   git push origin main
   ```

2. **Check GitHub Actions**
   - Go to Actions tab in your repository
   - Verify deployment succeeds

3. **Test API endpoints**
   ```bash
   curl http://CONTROL_PLANE_HOST:3000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

## Phase 4: Frontend Deployment (Optional)

1. **Build frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect GitHub repo to Vercel
   - Set environment variable: `VITE_API_BASE=http://CONTROL_PLANE_HOST:3000/api`

## Testing the MVP

1. **Register a test user**
   ```bash
   curl -X POST http://CONTROL_PLANE_HOST:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@neustream.com","password":"test123"}'
   ```

2. **Configure OBS**
   - Server: `rtmp://MEDIA_SERVER_HOST/live`
   - Stream Key: Use the stream key from registration

3. **Add destinations** via the dashboard

## Troubleshooting

- **Port 3000 not accessible**: Check firewall rules on Oracle Cloud
- **nginx fails to start**: Check nginx config with `sudo nginx -t`
- **Database connection fails**: Verify PostgreSQL is running and credentials are correct
- **Stream authentication fails**: Check control plane API is accessible from media server