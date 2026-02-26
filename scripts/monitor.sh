#!/bin/bash
# ═══════════════════════════════════════════════════════
# Ramadhan API - Simple Monitoring Dashboard
# ═══════════════════════════════════════════════════════
# Usage: ./scripts/monitor.sh

# Configuration
APP_URL="http://localhost:3010"
DB_PATH="/var/lib/ramadhan-api/app.db"
SERVICE_NAME="ramadhan-api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🌙 Ramadhan API - Monitoring Dashboard        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Service Status
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ 🔧 Service Status                              │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"

if systemctl is-active --quiet $SERVICE_NAME; then
  echo -e "  ${GREEN}●${NC} Service: ${GREEN}Running${NC}"
  echo -e "  ${GREEN}●${NC} PID: $(systemctl show $SERVICE_NAME --property=MainPID --value)"
else
  echo -e "  ${RED}●${NC} Service: ${RED}Stopped${NC}"
fi
echo ""

# Resource Usage
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ 💻 Resource Usage                              │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"

# CPU & Memory
echo -e "  ${GREEN}●${NC} CPU Load: $(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | xargs)"
echo -e "  ${GREEN}●${NC} Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"

# Disk
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}')
if [ ${DISK_USAGE%\%} -lt 80 ]; then
  echo -e "  ${GREEN}●${NC} Disk: ${DISK_USAGE} used"
elif [ ${DISK_USAGE%\%} -lt 90 ]; then
  echo -e "  ${YELLOW}●${NC} Disk: ${DISK_USAGE} used (Warning)"
else
  echo -e "  ${RED}●${NC} Disk: ${DISK_USAGE} used (Critical)"
fi
echo ""

# Database Stats
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ 💾 Database Statistics                         │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"

if [ -f "$DB_PATH" ]; then
  DB_SIZE=$(du -h $DB_PATH | cut -f1)
  echo -e "  ${GREEN}●${NC} Size: ${DB_SIZE}"
  
  # Count records
  USERS=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM users;")
  AMALIAH=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM amaliah;")
  VERIFIED=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM amaliah WHERE parent_verified = 1;")
  
  echo -e "  ${GREEN}●${NC} Users: ${USERS}"
  echo -e "  ${GREEN}●${NC} Amaliah Records: ${AMALIAH}"
  echo -e "  ${GREEN}●${NC} Verified Records: ${VERIFIED}"
else
  echo -e "  ${RED}●${NC} Database not found"
fi
echo ""

# Recent Activity
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ 📊 Recent Activity (Last 10 entries)           │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"

if [ -f "$DB_PATH" ]; then
  sqlite3 $DB_PATH "
    SELECT 
      strftime('%d/%m %H:%M', parent_verified_at) as date,
      u.name as student,
      a.day as day
    FROM amaliah a
    JOIN users u ON a.user_id = u.id
    WHERE a.parent_verified = 1
    ORDER BY a.parent_verified_at DESC
    LIMIT 10;
  " | while IFS='|' read -r date student day; do
    echo -e "  ${GREEN}●${NC} ${date} - ${student} (Day ${day})"
  done
else
  echo -e "  ${YELLOW}No data available${NC}"
fi
echo ""

# Top Students
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ 🏆 Top Students (Most Days Verified)           │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"

if [ -f "$DB_PATH" ]; then
  sqlite3 $DB_PATH "
    SELECT 
      u.name,
      u.kelas,
      COUNT(*) as days
    FROM amaliah a
    JOIN users u ON a.user_id = u.id
    WHERE a.parent_verified = 1
    GROUP BY u.id
    ORDER BY days DESC
    LIMIT 5;
  " | while IFS='|' read -r name kelas days; do
    echo -e "  ${GREEN}●${NC} ${name} (${kelas}) - ${days} days"
  done
else
  echo -e "  ${YELLOW}No data available${NC}"
fi
echo ""

# Latest Logs
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ 📝 Latest Error Logs (Last 5)                  │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"

LOG_FILE="/var/log/ramadhan-api/error.log"
if [ -f "$LOG_FILE" ]; then
  tail -5 $LOG_FILE | while read -r line; do
    echo -e "  ${YELLOW}│${NC} ${line:0:60}"
  done
else
  echo -e "  ${GREEN}●${NC} No error logs found"
fi
echo ""

# Quick Actions
echo -e "${CYAN}┌────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│ ⚡ Quick Actions                                 │${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────┘${NC}"
echo -e "  [1] Restart Service"
echo -e "  [2] View Full Logs"
echo -e "  [3] Backup Database"
echo -e "  [4] Exit"
echo ""
read -p "  Choose action (1-4): " -n 1 -r
echo ""

case $REPLY in
  1)
    echo -e "  ${YELLOW}Restarting service...${NC}"
    systemctl restart $SERVICE_NAME
    echo -e "  ${GREEN}Done!${NC}"
    ;;
  2)
    tail -50 /var/log/ramadhan-api/out.log
    ;;
  3)
    echo -e "  ${YELLOW}Creating backup...${NC}"
    /opt/ramadhan-api/backup-db.sh
    ;;
  4)
    echo -e "  ${GREEN}Exiting...${NC}"
    exit 0
    ;;
  *)
    echo -e "  ${RED}Invalid option${NC}"
    ;;
esac

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Refresh in 10 seconds... (Ctrl+C to exit)${NC}"
