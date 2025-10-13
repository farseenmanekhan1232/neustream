# Neustream CI/CD Deployment Fixes

## Executive Summary

The current GitHub Actions CI/CD pipeline has several critical deployment issues that prevent proper application deployment to production servers. This document outlines the identified problems and provides the corrected workflow.

## Critical Issues Identified

### 1. Directory Structure Mismatch
**Problem**: The workflow copies entire `control-plane/` and `media-server/` directories, but production expects files directly in `/opt/neustream/`

**Evidence**:
- Current workflow: `source: "control-plane/"` → creates `/opt/neustream/control-plane/`
- Production structure: Files should be directly in `/opt/neustream/`

### 2. Environment Variable Duplication
**Problem**: The workflow appends secrets to existing `.env` files, causing duplication and conflicts

**Evidence**:
- Current: `echo "POSTHOG_API_KEY=${{ secrets.POSTHOG_API_KEY }}" >> .env`
- Issue: Multiple deployments create duplicate entries

### 3. Incorrect Health Check Endpoints
**Problem**: Media server deployment checks for non-existent `/health` endpoint

**Evidence**:
- Media server only has `/stat` endpoint, not `/health`
- Current workflow: `curl -f https://stream.neustream.app/health`

### 4. Improper PM2 Process Management
**Problem**: Uses `pm2 restart || pm2 start` pattern which doesn't handle process state properly

**Evidence**:
- Current: `pm2 restart neustream-control-plane || pm2 start server.js --name neustream-control-plane`
- Issue: Doesn't properly stop processes before starting new ones

### 5. Missing Database Configuration
**Problem**: Control plane deployment doesn't include database environment variables

**Evidence**:
- Production `.env` contains: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Current workflow doesn't set these variables

## Key Fixes Applied

### 1. Fixed Directory Structure
```yaml
# Before
source: "control-plane/"
target: "/opt/neustream"

# After
source: "control-plane/*"
target: "/opt/neustream"
strip_components: 1
```

### 2. Fresh Environment Files
```bash
# Before
echo "POSTHOG_API_KEY=${{ secrets.POSTHOG_API_KEY }}" >> .env

# After
cat > .env << EOF
NODE_ENV=production
POSTHOG_API_KEY=${{ secrets.POSTHOG_API_KEY }}
# ... all other variables
EOF
```

### 3. Correct Health Checks
```bash
# Control Plane (has /health endpoint)
curl -f http://localhost:3000/health

# Media Server (only has /stat endpoint)
curl -f http://localhost:8000/stat
```

### 4. Proper PM2 Management
```bash
# Before
pm2 restart neustream-control-plane || pm2 start server.js --name neustream-control-plane

# After
pm2 stop neustream-control-plane || true
pm2 start server.js --name neustream-control-plane --env production
pm2 save
```

### 5. Complete Environment Variables
Added missing database configuration:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neustream
DB_USER=neustream_user
DB_PASSWORD=${{ secrets.DB_PASSWORD }}
```

## Additional Improvements

### 1. Error Handling
- Added proper error checking for health endpoints
- Added backup of existing `.env` files
- Added nginx configuration testing before reload

### 2. Security Enhancements
- Fresh environment files prevent secret accumulation
- Proper file permissions handling
- Secure secret management

### 3. Deployment Verification
- Local health checks before external verification
- Proper PM2 process management
- Service restart verification

## Required Secrets Update

The following new secrets need to be added to GitHub repository settings:

```
DB_PASSWORD=your_database_password
FRONTEND_URL=https://www.neustream.app
```

## Testing the Fixed Workflow

1. **Test Control Plane Deployment**:
   ```bash
   # Verify deployment
   ssh control-plane "curl -f http://localhost:3000/health"
   ssh control-plane "pm2 status"
   ```

2. **Test Media Server Deployment**:
   ```bash
   # Verify deployment
   ssh media-server "curl -f http://localhost:8000/stat"
   ssh media-server "pm2 status"
   ```

3. **Verify Nginx Configuration**:
   ```bash
   # Both servers
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Rollback Plan

If issues occur with the new deployment:

1. **Restore from backup**:
   ```bash
   # On each server
   cd /opt/neustream
   cp .env.backup .env
   pm2 restart neustream-control-plane
   pm2 restart neustream-media-server
   ```

2. **Revert to previous workflow** by restoring the original `ci-cd.yml`

## Monitoring Recommendations

1. **Set up alerts** for PM2 process failures
2. **Monitor health endpoints** regularly
3. **Track deployment success/failure rates**
4. **Set up log aggregation** for better debugging

## Next Steps

1. Add the missing secrets to GitHub repository
2. Test the updated workflow in a staging environment
3. Monitor the first production deployment closely
4. Consider implementing blue-green deployment for zero-downtime updates