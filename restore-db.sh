#!/bin/bash
# ═══════════════════════════════════════════════════════
# RAMADHAN API - Database Restore Script
# ═══════════════════════════════════════════════════════
# Usage: ./restore-db.sh [backup-file.gz]
# Example: ./restore-db.sh /backups/ramadhan/app_20260224_020000.db.gz

set -e

# Configuration
DB_PATH="/var/lib/ramadhan-api/app.db"
BACKUP_DIR="/backups/ramadhan"
SERVICE_NAME="ramadhan-api"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Ramadhan API - Database Restore    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Please run as root (sudo ./restore-db.sh)${NC}"
  exit 1
fi

# Get backup file
if [ -z "$1" ]; then
  echo -e "${YELLOW}Available backups:${NC}"
  ls -lh $BACKUP_DIR/*.gz 2>/dev/null | tail -10 || echo "No backups found"
  echo ""
  read -p "Enter backup file to restore: " BACKUP_FILE
else
  BACKUP_FILE="$1"
fi

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"
echo ""

# Confirm restore
echo -e "${RED}⚠️  WARNING: This will overwrite the current database!${NC}"
echo -e "${YELLOW}Current database will be backed up before restore.${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}Restore cancelled${NC}"
  exit 0
fi

# Stop service
echo -e "${YELLOW}[1/5] Stopping service...${NC}"
systemctl stop $SERVICE_NAME
echo -e "${GREEN}✓ Service stopped${NC}"

# Backup current database
echo -e "${YELLOW}[2/5] Backing up current database...${NC}"
CURRENT_BACKUP="$BACKUP_DIR/app_current_$(date +%Y%m%d_%H%M%S).db"
cp "$DB_PATH" "$CURRENT_BACKUP"
gzip "$CURRENT_BACKUP"
echo -e "${GREEN}✓ Current database backed up: ${CURRENT_BACKUP}.gz${NC}"

# Restore database
echo -e "${YELLOW}[3/5] Restoring database...${NC}"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" > "$DB_PATH"
else
  cp "$BACKUP_FILE" "$DB_PATH"
fi
echo -e "${GREEN}✓ Database restored${NC}"

# Set permissions
echo -e "${YELLOW}[4/5] Setting permissions...${NC}"
chown www-data:www-data "$DB_PATH"
chmod 640 "$DB_PATH"
echo -e "${GREEN}✓ Permissions set${NC}"

# Start service
echo -e "${YELLOW}[5/5] Starting service...${NC}"
systemctl start $SERVICE_NAME
sleep 2
systemctl status $SERVICE_NAME --no-pager
echo -e "${GREEN}✓ Service started${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ Restore Completed Successfully ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Verify:${NC}"
echo -e "  curl http://localhost:3002/"
echo ""
echo -e "${YELLOW}Previous database backed up at:${NC}"
echo -e "  ${CURRENT_BACKUP}.gz"
