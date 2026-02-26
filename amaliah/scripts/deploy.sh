#!/bin/bash
# ═══════════════════════════════════════════════════════
# Deployment Script - Buku Amaliah Ramadhan
# ═══════════════════════════════════════════════════════
# Automated deployment script for production server
#
# Usage: ./deploy.sh [environment]
# Environments: production, staging
# ═══════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="amaliah"
APP_DIR="/var/www/amaliah"
DB_DIR="/var/lib/amaliah"
ENVIRONMENT=${1:-production}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root or with sudo"
        exit 1
    fi
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v bun &> /dev/null; then
        log_warning "Bun not found. Installing..."
        curl -fsSL https://bun.sh/install | bash
    fi
    
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2 not found. Installing..."
        npm install -g pm2
    fi
    
    log_success "Dependencies check complete"
}

create_user() {
    log_info "Creating system user..."
    
    if id "amaliah" &>/dev/null; then
        log_warning "User 'amaliah' already exists"
    else
        useradd -r -m -s /bin/bash amaliah
        log_success "User 'amaliah' created"
    fi
}

setup_directories() {
    log_info "Setting up directories..."
    
    mkdir -p $APP_DIR
    mkdir -p $DB_DIR
    
    chown -R amaliah:amaliah $APP_DIR
    chown -R amaliah:amaliah $DB_DIR
    
    chmod 750 $DB_DIR
    
    log_success "Directories setup complete"
}

deploy_app() {
    log_info "Deploying application..."
    
    cd $APP_DIR
    
    # Pull latest code (if using git)
    if [ -d ".git" ]; then
        git pull origin main
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    bun install
    
    # Setup environment
    if [ ! -f ".env.production" ]; then
        log_warning "Setting up environment file..."
        cp .env.production.example .env.production
        echo "Please edit .env.production with your configuration"
    fi
    
    # Build application
    log_info "Building application..."
    bun run build
    
    log_success "Application deployed"
}

setup_database() {
    log_info "Setting up database..."
    
    cd $APP_DIR
    
    # Initialize database
    bun run bootstrap
    
    log_success "Database setup complete"
}

setup_systemd() {
    log_info "Setting up systemd service..."
    
    cat > /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=Buku Amaliah Ramadhan App
After=network.target

[Service]
Type=simple
User=amaliah
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/bun run $APP_DIR/build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3010

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable $APP_NAME
    
    log_success "Systemd service setup complete"
}

setup_nginx() {
    log_info "Setting up Nginx..."
    
    read -p "Enter your domain: " DOMAIN
    
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
    nginx -t
    systemctl restart nginx
    
    log_success "Nginx setup complete"
    log_info "To enable SSL, run: certbot --nginx -d $DOMAIN"
}

start_service() {
    log_info "Starting service..."
    
    systemctl start $APP_NAME
    systemctl status $APP_NAME --no-pager
    
    log_success "Service started"
}

backup_database() {
    log_info "Creating database backup..."
    
    BACKUP_DIR="/home/amaliah/backups"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p $BACKUP_DIR
    cp $DB_DIR/app.db $BACKUP_DIR/amaliah_$DATE.db
    
    # Keep only last 7 backups
    find $BACKUP_DIR -name "*.db" -mtime +7 -delete
    
    log_success "Database backed up to $BACKUP_DIR/amaliah_$DATE.db"
}

# Main deployment
main() {
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║   Buku Amaliah Ramadhan - Deployment Script         ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo ""
    
    check_root
    
    log_info "Starting deployment for environment: $ENVIRONMENT"
    echo ""
    
    # Pre-deployment
    check_dependencies
    create_user
    setup_directories
    
    # Deployment
    deploy_app
    setup_database
    setup_systemd
    
    # Optional: Nginx setup
    read -p "Setup Nginx? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_nginx
    fi
    
    # Start service
    start_service
    
    # Backup
    backup_database
    
    echo ""
    log_success "╔══════════════════════════════════════════════════════╗"
    log_success "║           Deployment Complete!                      ║"
    log_success "╚══════════════════════════════════════════════════════╝"
    echo ""
    log_info "Application URL: http://localhost:3010"
    log_info "Logs: journalctl -u $APP_NAME -f"
    log_info "Backup location: /home/amaliah/backups/"
    echo ""
}

# Run main function
main
