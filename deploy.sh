#!/bin/bash
# ═══════════════════════════════════════════════════════
# RAMADHAN API - Production Deployment Script
# ═══════════════════════════════════════════════════════
# Usage: ./deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ramadhan-api"
APP_DIR="/opt/ramadhan-api"
USER="www-data"
SERVICE_NAME="ramadhan-api"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Ramadhan API - Deployment Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Please run as root (sudo ./deploy.sh)${NC}"
  exit 1
fi

# Step 1: Create app directory
echo -e "${YELLOW}[1/8] Creating app directory...${NC}"
mkdir -p $APP_DIR
mkdir -p /var/lib/ramadhan-api
mkdir -p /var/log/ramadhan-api
mkdir -p /backups/ramadhan
echo -e "${GREEN}✓ Directories created${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}[2/8] Installing Bun...${NC}"
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  echo -e "${GREEN}✓ Bun installed${NC}"
else
  echo -e "${GREEN}✓ Bun already installed${NC}"
fi

# Step 3: Copy application files
echo -e "${YELLOW}[3/8] Copying application files...${NC}"
cp -r ./* $APP_DIR/
chown -R $USER:$USER $APP_DIR
echo -e "${GREEN}✓ Files copied${NC}"

# Step 4: Install npm dependencies
echo -e "${YELLOW}[4/8] Installing dependencies...${NC}"
cd $APP_DIR
su - $USER -c "cd $APP_DIR && bun install --production"
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 5: Setup environment
echo -e "${YELLOW}[5/8] Setting up environment...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
  cp $APP_DIR/.env.example $APP_DIR/.env
  echo -e "${YELLOW}⚠️  Please edit $APP_DIR/.env with your configuration${NC}"
  echo -e "${YELLOW}   Especially JWT_SECRET!${NC}"
  read -p "Press enter to continue after editing .env..."
fi
chown $USER:$USER $APP_DIR/.env
chmod 600 $APP_DIR/.env
echo -e "${GREEN}✓ Environment configured${NC}"

# Step 6: Setup database
echo -e "${YELLOW}[6/8] Setting up database...${NC}"
touch /var/lib/ramadhan-api/app.db
chown $USER:$USER /var/lib/ramadhan-api/app.db
chmod 640 /var/lib/ramadhan-api/app.db
echo -e "${GREEN}✓ Database ready${NC}"

# Step 7: Create systemd service
echo -e "${YELLOW}[7/8] Creating systemd service...${NC}"
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Ramadhan API Service
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
ExecStart=/home/$USER/.bun/bin/bun run src/index.ts
Restart=always
RestartSec=3
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env

# Security
NoNewPrivileges=true
PrivateTmp=true

# Logging
StandardOutput=append:/var/log/ramadhan-api/out.log
StandardError=append:/var/log/ramadhan-api/error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $SERVICE_NAME
echo -e "${GREEN}✓ Service created${NC}"

# Step 8: Start service
echo -e "${YELLOW}[8/8] Starting service...${NC}"
systemctl start $SERVICE_NAME
systemctl status $SERVICE_NAME --no-pager

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ Deployment Complete!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Service Status:${NC}"
echo -e "  systemctl status $SERVICE_NAME"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  tail -f /var/log/ramadhan-api/out.log"
echo -e "  tail -f /var/log/ramadhan-api/error.log"
echo ""
echo -e "${BLUE}Management:${NC}"
echo -e "  Start:   systemctl start $SERVICE_NAME"
echo -e "  Stop:    systemctl stop $SERVICE_NAME"
echo -e "  Restart: systemctl restart $SERVICE_NAME"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and set JWT_SECRET before first use!${NC}"
