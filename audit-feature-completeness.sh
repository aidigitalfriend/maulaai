#!/bin/bash
# 🔧 DETAILED FEATURE AUDIT SCRIPT
# Analyzes each feature module for completeness: UI + Logic + Config

echo "🔧 FEATURE-WISE COMPLETENESS AUDIT"
echo "==================================="
echo ""

PROJECT_ROOT="/Users/onelastai/Downloads/shiny-friend-disco"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check feature completeness
check_feature_completeness() {
    local feature_name="$1"
    local base_path="$2"
    
    echo -e "${BLUE}📦 $feature_name${NC}"
    echo "$(printf '%.50s' "$(printf '%*s' 50 '' | tr ' ' '-')")"
    
    local has_ui=false
    local has_logic=false
    local has_config=false
    
    # Check for UI files (.tsx)
    if find "$base_path" -maxdepth 2 -name "*.tsx" -not -path "*/node_modules/*" | grep -q .; then
        has_ui=true
        echo -e "  ${GREEN}✅ UI Layer (.tsx)${NC}"
        find "$base_path" -maxdepth 2 -name "*.tsx" -not -path "*/node_modules/*" | head -3 | sed 's/^/    → /'
    else
        echo -e "  ${RED}❌ UI Layer (.tsx) - MISSING${NC}"
    fi
    
    # Check for Logic files (.ts)
    if find "$base_path" -maxdepth 2 -name "*.ts" -not -path "*/node_modules/*" | grep -q .; then
        has_logic=true
        echo -e "  ${GREEN}✅ Logic Layer (.ts)${NC}"
        find "$base_path" -maxdepth 2 -name "*.ts" -not -path "*/node_modules/*" | head -3 | sed 's/^/    → /'
    else
        echo -e "  ${RED}❌ Logic Layer (.ts) - MISSING${NC}"
    fi
    
    # Check for Config files (.js)
    if find "$base_path" -maxdepth 2 -name "*.js" -not -path "*/node_modules/*" | grep -q .; then
        has_config=true
        echo -e "  ${GREEN}✅ Config Layer (.js)${NC}"
        find "$base_path" -maxdepth 2 -name "*.js" -not -path "*/node_modules/*" | head -3 | sed 's/^/    → /'
    else
        echo -e "  ${YELLOW}⚠️  Config Layer (.js) - Optional${NC}"
    fi
    
    # Overall completeness score
    local completeness=0
    $has_ui && ((completeness++))
    $has_logic && ((completeness++))
    $has_config && ((completeness++))
    
    case $completeness in
        3) echo -e "  ${GREEN}🎯 COMPLETE (3/3)${NC}" ;;
        2) echo -e "  ${YELLOW}🔧 PARTIAL (2/3)${NC}" ;;
        1) echo -e "  ${RED}⚠️  INCOMPLETE (1/3)${NC}" ;;
        0) echo -e "  ${RED}❌ EMPTY (0/3)${NC}" ;;
    esac
    
    echo ""
}

echo "🎯 ANALYZING MAJOR FEATURE MODULES:"
echo "====================================="

# 1. Authentication System
check_feature_completeness "Authentication System" "frontend/app/auth"
check_feature_completeness "Auth Backend" "backend/app/api/auth"

# 2. Agent System
check_feature_completeness "Agent Components" "frontend/components/Agent*"
check_feature_completeness "Agent API Backend" "backend/app/api/agents"

# 3. Dashboard
check_feature_completeness "Dashboard Pages" "frontend/app/dashboard"
check_feature_completeness "Dashboard API" "backend/app/api/dashboard"

# 4. AI Lab
check_feature_completeness "AI Lab Frontend" "frontend/app/lab"
check_feature_completeness "AI Lab Backend" "backend/app/api/lab"

# 5. Tools
check_feature_completeness "Tools Frontend" "frontend/app/tools"
check_feature_completeness "Tools Backend" "backend/app/api/tools" 

# 6. Subscription System
check_feature_completeness "Subscription Frontend" "frontend/app/pricing"
check_feature_completeness "Subscription Backend" "backend/app/api/subscriptions"

echo ""
echo -e "${GREEN}📊 FEATURE AUDIT SUMMARY${NC}"
echo "========================="

# Count complete vs incomplete features
echo "Analyzing feature completeness across the project..."

# Individual Agent Analysis
echo ""
echo -e "${BLUE}🤖 INDIVIDUAL AGENT ANALYSIS:${NC}"
echo "------------------------------"

find frontend/app/agents -maxdepth 1 -type d -not -name "agents" | while read agent_dir; do
    if [ -d "$agent_dir" ]; then
        agent_name=$(basename "$agent_dir")
        if [ "$agent_name" != "." ]; then
            
            has_page=$([ -f "$agent_dir/page.tsx" ] && echo "true" || echo "false")
            has_config=$([ -f "$agent_dir/config.ts" ] && echo "true" || echo "false") 
            has_index=$([ -f "$agent_dir/index.ts" ] && echo "true" || echo "false")
            
            if [ "$has_page" = "true" ] && ([ "$has_config" = "true" ] || [ "$has_index" = "true" ]); then
                echo -e "  ${GREEN}✅ $agent_name${NC} - Complete"
            elif [ "$has_page" = "true" ]; then
                echo -e "  ${YELLOW}🔧 $agent_name${NC} - Missing config/logic"
            elif [ "$has_config" = "true" ] || [ "$has_index" = "true" ]; then
                echo -e "  ${RED}❌ $agent_name${NC} - Missing UI page"
            else
                echo -e "  ${RED}💀 $agent_name${NC} - Empty folder"
            fi
        fi
    fi
done

echo ""
echo -e "${GREEN}✅ FEATURE AUDIT COMPLETE!${NC}"