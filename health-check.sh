#!/bin/bash

# ExpenseTracker Health Check Script
# Tests if all services are responding correctly

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ExpenseTracker Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if containers are running
echo -e "${YELLOW}Checking if containers are running...${NC}"
if ! docker ps | grep -q "expense_tracker"; then
    echo -e "${RED}❌ No ExpenseTracker containers are running!${NC}"
    echo -e "${YELLOW}Please run ./start.sh first${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Containers are running${NC}"
echo ""

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -e "${YELLOW}Checking $name...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ $name is responding (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not responding correctly (HTTP $response, expected $expected)${NC}"
        return 1
    fi
}

# Check Frontend
check_service "Frontend" "http://localhost:3000" "200"

# Check Backend (should return 404 for root, but service is up)
echo -e "${YELLOW}Checking Backend...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001/api/expenses" 2>/dev/null)
if [ "$response" = "200" ] || [ "$response" = "500" ]; then
    echo -e "${GREEN}✓ Backend is responding (HTTP $response)${NC}"
else
    echo -e "${RED}❌ Backend is not responding correctly (HTTP $response)${NC}"
fi

# Check ML Service
echo -e "${YELLOW}Checking ML Service...${NC}"
ml_response=$(curl -s -X POST http://localhost:5002/predict-category \
    -H "Content-Type: application/json" \
    -d '{"description": "Coffee at Starbucks"}' 2>/dev/null)

if echo "$ml_response" | grep -q "category"; then
    category=$(echo "$ml_response" | grep -o '"category":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ ML Service is working! Predicted category: $category${NC}"
else
    echo -e "${RED}❌ ML Service is not responding correctly${NC}"
    echo -e "${RED}Response: $ml_response${NC}"
fi

# Check Database
echo -e "${YELLOW}Checking Database...${NC}"
if docker exec expense_tracker_db pg_isready -U apaliwal -d expensetracker >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is ready${NC}"
else
    echo -e "${RED}❌ Database is not ready${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Health Check Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Services:"
echo -e "  Frontend:     http://localhost:3000"
echo -e "  Backend API:  http://localhost:5001"
echo -e "  ML Service:   http://localhost:5002"
echo -e "  Database:     localhost:5433"
echo ""
