#!/bin/bash

# ExpenseTracker Application Startup Script
# This script builds and starts all services (backend, frontend, ML service, database)

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ExpenseTracker Application Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop and try again.${NC}"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f ./backend/.env ]; then
    echo -e "${YELLOW}Warning: backend/.env file not found.${NC}"
    echo -e "${YELLOW}Creating a template .env file...${NC}"
    cat > ./backend/.env << EOF
# Database Configuration
POSTGRES_USER=expense_user
POSTGRES_PASSWORD=expense_password
POSTGRES_DB=expense_tracker
DATABASE_URL=postgresql://expense_user:expense_password@postgres:5432/expense_tracker

# Server Configuration
PORT=5000

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-change-this-in-production

# ML Service
ML_SERVICE_URL=http://ml_service:5000
EOF
    echo -e "${GREEN}Created backend/.env file. Please review and update if needed.${NC}"
fi

# Stop any running containers
echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Remove old containers (optional - uncomment if you want a clean start)
# echo -e "${YELLOW}Removing old containers...${NC}"
# docker-compose rm -f

# Build all services
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose build --no-cache

# Start all services
echo -e "${BLUE}Starting all services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check if containers are running
echo ""
echo -e "${BLUE}Checking service status...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Application Started Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Services available at:${NC}"
echo -e "  ${BLUE}Frontend:${NC}     http://localhost:3000"
echo -e "  ${BLUE}Backend API:${NC}  http://localhost:5001"
echo -e "  ${BLUE}ML Service:${NC}   http://localhost:5002"
echo -e "  ${BLUE}Database:${NC}     localhost:5433"
echo ""
echo -e "${YELLOW}To view logs:${NC}          docker-compose logs -f"
echo -e "${YELLOW}To view specific logs:${NC} docker-compose logs -f [service-name]"
echo -e "${YELLOW}To stop all services:${NC} docker-compose down"
echo -e "${YELLOW}Or use:${NC}               ./stop.sh"
echo ""
