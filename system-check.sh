#!/bin/bash

# AI Agent Platform System Check
# Comprehensive verification script for the complete system

echo "🔍 Starting comprehensive system check for AI Agent Platform..."
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
total_checks=0
passed_checks=0

check_result() {
    local result=$1
    local message=$2
    
    total_checks=$((total_checks + 1))
    
    if [ $result -eq 0 ]; then
        echo -e "✅ $message"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "❌ $message"
    fi
}

echo -e "ℹ️  === DIRECTORY STRUCTURE CHECK ==="

# Check frontend structure
echo "🏗️  Checking frontend structure..."
if [ -d "frontend/app/agents" ]; then
    agent_count=$(find frontend/app/agents -name "*.tsx" -type f | grep -v page.tsx | wc -l)
    check_result 0 "Frontend agents directory exists with $agent_count agents"
else
    check_result 1 "Frontend agents directory missing"
fi

if [ -f "frontend/lib/ai-service.ts" ]; then
    check_result 0 "AI service integration exists"
else
    check_result 1 "AI service integration missing"
fi

if [ -f "frontend/components/Navigation.tsx" ]; then
    check_result 0 "Navigation component exists"
else
    check_result 1 "Navigation component missing"
fi

# Check backend structure
echo "🔧 Checking backend structure..."
if [ -d "backend/app/api" ]; then
    endpoint_count=$(find backend/app/api -name "route.ts" -type f | wc -l)
    check_result 0 "Backend API directory exists with $endpoint_count endpoints"
else
    check_result 1 "Backend API directory missing"
fi

if [ -f "backend/app/api/utils/agent-personalities.ts" ]; then
    check_result 0 "Agent personality system exists"
else
    check_result 1 "Agent personality system missing"
fi

echo ""
echo -e "ℹ️  === DEPENDENCY CHECK ==="

# Check frontend dependencies
echo "📦 Checking frontend dependencies..."
if [ -f "frontend/package.json" ] && [ -d "frontend/node_modules" ]; then
    check_result 0 "Frontend dependencies installed"
else
    check_result 1 "Frontend dependencies missing"
fi

# Check backend dependencies
echo "📦 Checking backend dependencies..."
if [ -f "backend/package.json" ] && [ -d "backend/node_modules" ]; then
    check_result 0 "Backend dependencies installed"
else
    check_result 1 "Backend dependencies missing"
fi

echo ""
echo -e "ℹ️  === BUILD TESTS ==="

# Test frontend build
echo "🏗️  Testing frontend build..."
cd frontend
if npm run build > /dev/null 2>&1; then
    check_result 0 "Frontend builds successfully"
else
    check_result 1 "Frontend build failed"
fi
cd ..

# Test backend TypeScript compilation
echo "🏗️  Testing backend TypeScript compilation..."
cd backend
if npx tsc --noEmit > /dev/null 2>&1; then
    check_result 0 "Backend TypeScript compiles successfully"
else
    check_result 1 "Backend TypeScript compilation failed"
fi
cd ..

echo ""
echo -e "ℹ️  === CONFIGURATION CHECK ==="

# Check workspace configuration
if [ -f "package.json" ]; then
    check_result 0 "Root workspace configuration exists"
else
    check_result 1 "Root workspace configuration missing"
fi

# Check backend environment
if [ -f "backend/.env.example" ]; then
    check_result 0 "Backend environment template exists"
else
    check_result 1 "Backend environment template missing"
fi

echo ""
echo -e "ℹ️  === ROUTE ANALYSIS ==="

# Count frontend routes
frontend_routes=0
agent_routes=0
if [ -d "frontend/app" ]; then
    frontend_routes=$(find frontend/app -name "page.tsx" -type f | wc -l)
    agent_routes=$(find frontend/app/agents -name "page.tsx" -type f 2>/dev/null | wc -l)
    other_routes=$((frontend_routes - agent_routes))
    
    echo -e "ℹ️  Frontend Routes:"
    echo "  • Total routes: $frontend_routes"
    echo "  • Agent routes: $agent_routes"
    echo "  • Other routes: $other_routes"
fi

# Count backend API endpoints
backend_endpoints=0
if [ -d "backend/app/api" ]; then
    backend_endpoints=$(find backend/app/api -name "route.ts" -type f | wc -l)
    echo -e "ℹ️  Backend API Endpoints:"
    echo "  • API endpoints: $backend_endpoints"
    echo "  • Available services:"
    find backend/app/api -name "route.ts" -type f | sed 's|backend/app/api/||g' | sed 's|/route.ts||g' | sed 's|^|    - |g'
fi

echo ""
echo -e "ℹ️  === INTEGRATION STATUS ==="

# Check AI service integration
ai_integrated_agents=0
total_agent_files=0
if [ -d "frontend/app/agents" ]; then
    total_agent_files=$(find frontend/app/agents -name "*.tsx" -type f ! -name "page.tsx" | wc -l)
    ai_integrated_agents=$(grep -r "AIService\|ai-service" frontend/app/agents/ --include="*.tsx" | grep -v page.tsx | wc -l)
    
    echo "  • Agents with AI service integration: $ai_integrated_agents"
    echo "  • Total agent implementation files: $total_agent_files"
    
    if [ $ai_integrated_agents -gt 0 ]; then
        check_result 0 "At least one agent uses backend AI integration"
    else
        check_result 1 "No agents use backend AI integration"
    fi
fi

echo ""
echo -e "ℹ️  === SUMMARY ==="

# Calculate percentage
if [ $total_checks -gt 0 ]; then
    percentage=$((passed_checks * 100 / total_checks))
else
    percentage=0
fi

echo -e "📊 System Health Score: ${percentage}% (${passed_checks}/${total_checks} checks passed)"

if [ $percentage -eq 100 ]; then
    echo -e "${GREEN}✅ System is well-configured and ready for development!${NC}"
elif [ $percentage -ge 80 ]; then
    echo -e "${YELLOW}⚠️  System is mostly configured but needs some attention${NC}"
else
    echo -e "${RED}❌ System needs significant configuration work${NC}"
fi

echo ""
echo -e "ℹ️  === NEXT STEPS ==="
echo "1. Configure environment variables in backend/.env.local"
echo "2. Update remaining agents to use AIService integration"
echo "3. Test the system with: npm run dev"
echo "4. Access frontend at: http://localhost:3003"
echo "5. Access backend API at: http://localhost:3004"

echo ""
echo "🚀 System check complete!"