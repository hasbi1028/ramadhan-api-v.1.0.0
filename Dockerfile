# ═══════════════════════════════════════════════════════
# Ramadhan API - Dockerfile
# ═══════════════════════════════════════════════════════
# Usage: 
#   docker build -t ramadhan-api:latest .
#   docker-compose up -d

FROM oven/bun:1.0-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --production

# Copy application files
COPY . .

# Create directories
RUN mkdir -p /var/lib/ramadhan-api /var/log/ramadhan-api /backups/ramadhan

# Set permissions
RUN chown -R bun:bun /app /var/lib/ramadhan-api /var/log/ramadhan-api /backups/ramadhan

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun -e "fetch('http://localhost:3002/').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_PATH=/var/lib/ramadhan-api/app.db

# Run application
USER bun
CMD ["bun", "run", "src/index.ts"]
