#!/bin/bash
# ═══════════════════════════════════════════════════════
# Ramadhan API - Health Check Script
# ═══════════════════════════════════════════════════════
# Usage: ./scripts/health-check.sh
# Schedule: Every 5 minutes via cron
# Crontab: */5 * * * * /opt/ramadhan-api/scripts/health-check.sh

set -e

# Configuration
APP_URL="http://localhost:3002"
SERVICE_NAME="ramadhan-api"
LOG_FILE="/var/log/ramadhan-api/health-check.log"
ALERT_EMAIL="admin@school.sch.id"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
  echo -e "[$TIMESTAMP] $1" | tee -a $LOG_FILE
}

# Check if service is running
check_service() {
  if systemctl is-active --quiet $SERVICE_NAME; then
    return 0
  else
    return 1
  fi
}

# Check HTTP response
check_http() {
  local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $APP_URL/)
  if [ "$response" = "200" ]; then
    return 0
  else
    return 1
  fi
}

# Check API endpoint
check_api() {
  local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $APP_URL/api/auth/me)
  if [ "$response" = "401" ]; then
    # 401 is expected (unauthorized without token)
    return 0
  else
    return 1
  fi
}

# Check disk space
check_disk() {
  local usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
  if [ $usage -lt 90 ]; then
    return 0
  else
    return 1
  fi
}

# Main health check
main() {
  local status="OK"
  local issues=()

  # Check service
  if ! check_service; then
    status="CRITICAL"
    issues+=("Service $SERVICE_NAME is not running")
  fi

  # Check HTTP
  if ! check_http; then
    status="WARNING"
    issues+=("HTTP check failed")
  fi

  # Check API
  if ! check_api; then
    status="WARNING"
    issues+=("API check failed")
  fi

  # Check disk
  if ! check_disk; then
    status="WARNING"
    issues+=("Disk usage above 90%")
  fi

  # Log result
  if [ "$status" = "OK" ]; then
    log "${GREEN}✓${NC} Health check: OK"
  else
    log "${RED}✗${NC} Health check: $status - ${issues[*]}"
    
    # Send alert if critical
    if [ "$status" = "CRITICAL" ]; then
      echo "Ramadhan API Health Alert: $status" | mail -s "ALERT: Ramadhan API Down" $ALERT_EMAIL 2>/dev/null || true
      
      # Try to restart service
      log "${YELLOW}Attempting to restart service...${NC}"
      systemctl restart $SERVICE_NAME
      
      sleep 5
      if check_service; then
        log "${GREEN}✓${NC} Service restarted successfully"
      else
        log "${RED}✗${NC} Failed to restart service"
      fi
    fi
  fi
}

# Run main function
main
