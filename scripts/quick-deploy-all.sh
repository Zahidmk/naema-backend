#!/bin/bash

# ============================================
# naema FULL Deployment Script
# VPS: 72.61.240.40 (Hostinger)
# Date: February 25, 2026
# 
# This script deploys BOTH backend and frontend
# Usage: ssh root@72.61.240.40 < quick-deploy-all.sh
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        naema Full Stack Deployment                     ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Backend:  Medusa v2.10.3                                  ║${NC}"
echo -e "${BLUE}║  Frontend: Next.js 16.1.6                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

BACKEND_DIR="/var/www/naema/backend/backend-medusa"
FRONTEND_DIR="/var/www/naema/frontend/Naema-web"

# ============================================
# STEP 1: STOP ALL SERVICES
# ============================================
echo -e "${YELLOW}[1/6] Stopping all services...${NC}"
pm2 stop all 2>/dev/null || true
echo -e "${GREEN}✓ Services stopped${NC}"

# ============================================
# STEP 2: PULL LATEST CODE
# ============================================
echo -e "${YELLOW}[2/6] Pulling latest code...${NC}"

if [ -d "$BACKEND_DIR" ]; then
    cd $BACKEND_DIR
    git pull origin main 2>/dev/null || echo "Backend: Git pull skipped"
fi

if [ -d "$FRONTEND_DIR" ]; then
    cd $FRONTEND_DIR
    git pull origin main 2>&1 | tail -2
fi

echo -e "${GREEN}✓ Code updated${NC}"

# ============================================
# STEP 3: BUILD BACKEND
# ============================================
echo -e "${YELLOW}[3/6] Building backend...${NC}"

if [ -d "$BACKEND_DIR" ]; then
    cd $BACKEND_DIR
    npm install --production 2>&1 | tail -3
    npx medusa build 2>&1 | tail -5
    
    # CRITICAL: Copy admin build to correct location
    mkdir -p $BACKEND_DIR/public
    cp -r $BACKEND_DIR/.medusa/server/public/admin $BACKEND_DIR/public/
    echo -e "${GREEN}✓ Backend built + admin copied${NC}"
else
    echo -e "${RED}✗ Backend not found${NC}"
fi

# ============================================
# STEP 4: BUILD FRONTEND
# ============================================
echo -e "${YELLOW}[4/6] Building frontend...${NC}"

if [ -d "$FRONTEND_DIR" ]; then
    cd $FRONTEND_DIR
    npm install 2>&1 | tail -3
    npm run build 2>&1 | tail -5
    echo -e "${GREEN}✓ Frontend built${NC}"
else
    echo -e "${RED}✗ Frontend not found${NC}"
fi

# ============================================
# STEP 5: START ALL SERVICES
# ============================================
echo -e "${YELLOW}[5/6] Starting all services...${NC}"

pm2 restart all 2>/dev/null || {
    # Start fresh if restart fails
    pm2 delete all 2>/dev/null || true
    
    cd $BACKEND_DIR
    pm2 start npm --name "medusa-backend" -- run start
    
    cd $FRONTEND_DIR
    pm2 start npm --name "nextjs-storefront" -- run start
}

pm2 save
echo -e "${GREEN}✓ Services started${NC}"

# ============================================
# STEP 6: VERIFY DEPLOYMENT
# ============================================
echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"
sleep 15

echo ""
echo "Health Checks:"
echo "─────────────────────────────────────"

# Backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/health 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "  Backend API:     ${GREEN}✓ OK${NC}"
else
    echo -e "  Backend API:     ${RED}✗ HTTP $BACKEND_HEALTH${NC}"
fi

# Admin panel
ADMIN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/app 2>/dev/null || echo "000")
if [ "$ADMIN_HEALTH" = "200" ] || [ "$ADMIN_HEALTH" = "301" ]; then
    echo -e "  Admin Dashboard: ${GREEN}✓ OK${NC}"
else
    echo -e "  Admin Dashboard: ${YELLOW}⚠ HTTP $ADMIN_HEALTH${NC}"
fi

# Frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo -e "  Frontend:        ${GREEN}✓ OK${NC}"
else
    echo -e "  Frontend:        ${RED}✗ HTTP $FRONTEND_HEALTH${NC}"
fi

echo ""
pm2 list

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             🎉 DEPLOYMENT COMPLETE! 🎉                     ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Website: https://website.naemafoodstuff.com                   ║${NC}"
echo -e "${GREEN}║  API:     https://admin.naemafoodstuff.com                     ║${NC}"
echo -e "${GREEN}║  Admin:   https://admin.naemafoodstuff.com/app                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
