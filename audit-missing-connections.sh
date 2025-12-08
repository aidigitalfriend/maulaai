#!/bin/bash
# 🔍 MISSING CONNECTIONS AUDIT SCRIPT
# Finds orphaned components, unused APIs, and duplicate files

echo "🔍 SHINY FRIEND DISCO - MISSING CONNECTIONS AUDIT"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/onelastai/Downloads/shiny-friend-disco"
cd "$PROJECT_ROOT"

echo "📊 AUDIT SUMMARY:"
echo "=================="

# 1. Find TSX components without supporting TS logic
echo -e "${BLUE}1. ORPHANED TSX COMPONENTS (UI without Logic):${NC}"
echo "----------------------------------------------"

# Extract component names from TSX files
find frontend/components -name "*.tsx" -not -path "*/node_modules/*" | while read tsx_file; do
    component_name=$(basename "$tsx_file" .tsx)
    
    # Check if corresponding TS logic exists
    ts_logic=$(find . -name "${component_name}.ts" -not -path "*/node_modules/*" -not -path "*/.next/*" 2>/dev/null)
    
    if [ -z "$ts_logic" ]; then
        echo "  ❌ ${component_name}.tsx → No matching ${component_name}.ts found"
    fi
done

echo ""

# 2. Find TS APIs not used in TSX files
echo -e "${BLUE}2. UNUSED API ENDPOINTS (Logic without UI):${NC}"
echo "-------------------------------------------"

# Check backend API routes
find backend/app/api -name "route.ts" -not -path "*/node_modules/*" | while read api_file; do
    api_path=$(dirname "$api_file" | sed 's|backend/app||')
    api_name=$(echo "$api_path" | sed 's|/|-|g' | sed 's|^-||')
    
    # Search for usage in frontend
    usage_count=$(grep -r "$api_path" frontend/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
    
    if [ "$usage_count" -eq 0 ]; then
        echo "  ❌ $api_path → Not used in frontend"
    fi
done

echo ""

# 3. Find duplicate file names across folders
echo -e "${BLUE}3. DUPLICATE FILE NAMES:${NC}"
echo "------------------------"

# Find all files and group by basename
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | \
while read file; do
    echo "$(basename "$file"):$file"
done | sort | uniq -d -f1 | while IFS=: read basename filepath; do
    echo "  ⚠️  Duplicate: $basename"
    find . -name "$basename" -not -path "*/node_modules/*" -not -path "*/.next/*" | sed 's/^/    → /'
    echo ""
done

echo ""

# 4. Find agent configs without pages
echo -e "${BLUE}4. AGENT CONFIGS WITHOUT PAGES:${NC}"
echo "--------------------------------"

find frontend/app/agents -name "config.ts" -not -path "*/node_modules/*" | while read config_file; do
    agent_dir=$(dirname "$config_file")
    agent_name=$(basename "$agent_dir")
    
    if [ ! -f "$agent_dir/page.tsx" ]; then
        echo "  ❌ $agent_name → Has config.ts but no page.tsx"
    fi
done

echo ""

# 5. Find pages without configs
echo -e "${BLUE}5. AGENT PAGES WITHOUT CONFIGS:${NC}"
echo "--------------------------------"

find frontend/app/agents -name "page.tsx" -not -path "*/node_modules/*" | while read page_file; do
    agent_dir=$(dirname "$page_file")
    agent_name=$(basename "$agent_dir")
    
    if [ ! -f "$agent_dir/config.ts" ] && [ ! -f "$agent_dir/index.ts" ]; then
        echo "  ❌ $agent_name → Has page.tsx but no config.ts or index.ts"
    fi
done

echo ""

# 6. Find missing imports (basic check)
echo -e "${BLUE}6. POTENTIAL MISSING IMPORTS:${NC}"
echo "-----------------------------"

# Check for common import patterns
find frontend -name "*.tsx" -not -path "*/node_modules/*" | head -10 | while read tsx_file; do
    # Check if file imports from components but components don't exist
    grep -n "from.*components/" "$tsx_file" 2>/dev/null | while IFS=: read line_num import_line; do
        component_path=$(echo "$import_line" | sed -n "s/.*from ['\"]\.\.\/\?\(components\/[^'\"]*\)['\"].*/\1/p")
        if [ -n "$component_path" ]; then
            full_path="frontend/$component_path"
            if [ ! -f "$full_path.tsx" ] && [ ! -f "$full_path.ts" ] && [ ! -f "$full_path/index.tsx" ]; then
                echo "  ⚠️  $tsx_file:$line_num → $component_path (not found)"
            fi
        fi
    done
done

echo ""
echo -e "${GREEN}✅ AUDIT COMPLETE!${NC}"
echo "==================="
echo ""
echo "📋 NEXT STEPS:"
echo "• Review orphaned components and create supporting logic"
echo "• Remove or implement unused API endpoints" 
echo "• Resolve duplicate file naming conflicts"
echo "• Complete agent configurations"
echo ""