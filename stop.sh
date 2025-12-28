#!/bin/bash

# ExpenseTracker Application Stop Script
# This script stops all running services

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Stopping ExpenseTracker Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Stop all services
docker-compose down

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
echo ""
echo -e "To remove all data (volumes), run: docker-compose down -v"
echo ""
