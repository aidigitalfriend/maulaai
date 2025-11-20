#!/bin/bash
# Quick verification and setup script for shiny-friend-disco

set -e  # Exit on error

echo "🔍 Shiny Friend Disco - Path & Environment Check"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect environment
echo "📍 Path Detection:"
node path-config.js
echo ""

# Check Node version
echo "🔧 System Requirements:"
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "  Node: ${NODE_VERSION} (Required: >=18.0.0)"
echo "  NPM: ${NPM_VERSION} (Required: >=8.0.0)"
echo ""

# Check environment files
echo "📁 Environment Files:"
if [ -f ".env" ]; then
  echo -e "  ${GREEN}✓${NC} Root .env found"
else
  echo -e "  ${RED}✗${NC} Root .env MISSING"
fi

if [ -f "frontend/.env" ]; then
  echo -e "  ${GREEN}✓${NC} Frontend .env found"
else
  echo -e "  ${YELLOW}⚠${NC} Frontend .env missing"
fi

if [ -f "backend/.env" ]; then
  echo -e "  ${GREEN}✓${NC} Backend .env found"
else
  echo -e "  ${RED}✗${NC} Backend .env MISSING"
fi
echo ""

# Check dependencies
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} Root node_modules installed"
else
  echo -e "  ${YELLOW}⚠${NC} Root dependencies not installed"
fi

if [ -d "frontend/node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} Frontend node_modules installed"
else
  echo -e "  ${YELLOW}⚠${NC} Frontend dependencies not installed"
fi

if [ -d "backend/node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} Backend node_modules installed"
else
  echo -e "  ${YELLOW}⚠${NC} Backend dependencies not installed"
fi
echo ""

# Check if MongoDB is running
echo "🗄️  MongoDB Status:"
if command -v mongod &> /dev/null; then
  if pgrep -x "mongod" > /dev/null; then
    echo -e "  ${GREEN}✓${NC} MongoDB is running"
  else
    echo -e "  ${YELLOW}⚠${NC} MongoDB installed but not running"
    echo "     Start with: brew services start mongodb-community (macOS)"
    echo "              or: sudo systemctl start mongod (Linux)"
  fi
else
  echo -e "  ${RED}✗${NC} MongoDB not installed"
  echo "     Install: brew install mongodb-community (macOS)"
  echo "           or: sudo apt install mongodb (Ubuntu)"
fi
echo ""

# Check ports
echo "🌐 Port Availability:"
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} Port 3000 (frontend) available"
else
  echo -e "  ${YELLOW}⚠${NC} Port 3000 already in use"
  echo "     Process: $(lsof -Pi :3000 -sTCP:LISTEN | tail -n 1)"
fi

if ! lsof -Pi :3005 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} Port 3005 (backend) available"
else
  echo -e "  ${YELLOW}⚠${NC} Port 3005 already in use"
  echo "     Process: $(lsof -Pi :3005 -sTCP:LISTEN | tail -n 1)"
fi
echo ""

# Check Google Drive location
echo "☁️  Storage Location:"
if [[ "$PWD" == *"Google Drive"* ]] || [[ "$PWD" == *"GoogleDrive"* ]]; then
  echo -e "  ${RED}⚠ WARNING${NC}: Project is in Google Drive!"
  echo "     This can cause sync conflicts with node_modules and build files."
  echo "     Recommended: Move to ~/Projects/shiny-friend-disco"
  echo ""
  echo "     Quick fix:"
  echo "       mkdir -p ~/Projects"
  echo "       cp -r \"$PWD\" ~/Projects/shiny-friend-disco"
  echo "       cd ~/Projects/shiny-friend-disco"
else
  echo -e "  ${GREEN}✓${NC} Project in local storage (not cloud-synced)"
fi
echo ""

# Summary
echo "================================================="
echo "📊 SUMMARY"
echo "================================================="

ISSUES=0

if [ ! -f ".env" ]; then
  echo -e "${RED}✗${NC} Missing root .env file"
  ((ISSUES++))
fi

if [ ! -f "backend/.env" ]; then
  echo -e "${RED}✗${NC} Missing backend .env file"
  ((ISSUES++))
fi

if [ ! -d "backend/node_modules" ]; then
  echo -e "${YELLOW}⚠${NC} Backend dependencies not installed"
  ((ISSUES++))
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
  ((ISSUES++))
fi

if [[ "$PWD" == *"Google Drive"* ]]; then
  echo -e "${YELLOW}⚠${NC} Project in Google Drive (not recommended)"
  ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo ""
  echo "Ready to start development:"
  echo "  npm run dev              # Start both frontend and backend"
  echo "  npm run dev:frontend     # Start frontend only"
  echo "  npm run dev:backend      # Start backend only"
else
  echo -e "${YELLOW}Found $ISSUES issue(s) - see above for details${NC}"
  echo ""
  echo "Quick fixes:"
  echo "  npm run install:all      # Install all dependencies"
  echo "  cp .env.example .env     # Create root .env"
  echo ""
  echo "See AUTHORIZATION_SECURITY_ANALYSIS.md for detailed guidance"
fi
echo ""
