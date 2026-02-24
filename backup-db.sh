#!/bin/bash
# ═══════════════════════════════════════════════════════
# RAMADHAN API - Database Backup Script
# ═══════════════════════════════════════════════════════
# Usage: ./backup-db.sh
# Schedule: Daily at 2 AM via cron
# Crontab: 0 2 * * * /opt/ramadhan-api/backup-db.sh

set -e

# Configuration
APP_NAME="ramadhan-api"
DB_PATH="/var/lib/ramadhan-api/app.db"
BACKUP_DIR="/backups/ramadhan"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/app_$TIMESTAMP.db"

echo -e "${YELLOW}[${TIMESTAMP}] Starting backup...${NC}"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
  echo -e "${RED}❌ Database not found: $DB_PATH${NC}"
  exit 1
fi

# Create backup
cp "$DB_PATH" "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup created: ${BACKUP_FILE}.gz${NC}"

# Calculate size
SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo -e "${GREEN}  Size: ${SIZE}${NC}"

# Cleanup old backups
echo -e "${YELLOW}Cleaning up backups older than ${RETENTION_DAYS} days...${NC}"
DELETED=$(find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✓ Deleted $DELETED old backup(s)${NC}"

# List current backups
echo -e "${YELLOW}Current backups:${NC}"
ls -lh $BACKUP_DIR/*.gz 2>/dev/null | tail -5 || echo "No backups found"

echo -e "${GREEN}✓ Backup completed successfully${NC}"

# Optional: Send notification (uncomment if mail is configured)
# echo "Backup completed: ${BACKUP_FILE}.gz (${SIZE})" | mail -s "Ramadhan API Backup" admin@example.com

exit 0
