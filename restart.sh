#!/bin/bash

# ExpenseTracker Application Restart Script
# This script restarts all services without rebuilding

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Restarting ExpenseTracker Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Restart all services
docker-compose restart

echo ""
echo -e "${GREEN}All services restarted successfully!${NC}"
echo ""
echo -e "Services available at:"
echo -e "  Frontend:     http://localhost:3000"
echo -e "  Backend API:  http://localhost:5001"
echo -e "  ML Service:   http://localhost:5002"
echo -e "  Database:     localhost:5433"
echo ""
