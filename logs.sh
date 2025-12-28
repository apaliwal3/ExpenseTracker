#!/bin/bash

# ExpenseTracker Logs Viewer Script

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ExpenseTracker Logs Viewer${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -z "$1" ]; then
    echo -e "${YELLOW}Showing logs for all services...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
    echo ""
    docker-compose logs -f
else
    echo -e "${YELLOW}Showing logs for $1...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
    echo ""
    docker-compose logs -f "$1"
fi
