#!/bin/bash

# =============================================================================
# SECURITY CHECK SCRIPT FOR GITHUB REPOSITORY
# =============================================================================
# This script checks for sensitive files and data before committing to GitHub
# Run this script before pushing to ensure no secrets are exposed

echo "🔍 GITHUB SECURITY CHECK - Scanning for sensitive files..."
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
WARNINGS=0
ERRORS=0

echo -e "\n${BLUE}1. Checking for sensitive files...${NC}"

# Check for actual .env files (not .env.example)
if find . -name ".env" -not -path "./node_modules/*" -not -path "./.next/*" | grep -q .; then
    echo -e "${RED}❌ Found .env files:${NC}"
    find . -name ".env" -not -path "./node_modules/*" -not -path "./.next/*"
    echo -e "${YELLOW}⚠️  Make sure these contain only placeholder values!${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No .env files found${NC}"
fi

# Check for .env.local files
if find . -name ".env.local" -not -path "./node_modules/*" -not -path "./.next/*" | grep -q .; then
    echo -e "${RED}❌ Found .env.local files:${NC}"
    find . -name ".env.local" -not -path "./node_modules/*" -not -path "./.next/*"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env.local files found${NC}"
fi

# Check for API key files
if find . -name "*api*key*" -not -path "./node_modules/*" -not -path "./.next/*" | grep -q .; then
    echo -e "${RED}❌ Found potential API key files:${NC}"
    find . -name "*api*key*" -not -path "./node_modules/*" -not -path "./.next/*"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No API key files found${NC}"
fi

# Check for certificate files
if find . \( -name "*.pem" -o -name "*.key" -o -name "*.crt" -o -name "*.cer" \) -not -path "./node_modules/*" -not -path "./.next/*" | grep -q .; then
    echo -e "${RED}❌ Found certificate/key files:${NC}"
    find . \( -name "*.pem" -o -name "*.key" -o -name "*.crt" -o -name "*.cer" \) -not -path "./node_modules/*" -not -path "./.next/*"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No certificate files found${NC}"
fi

# Check for APIKEYS.md file
if [ -f "APIKEYS.md" ]; then
    echo -e "${RED}❌ Found APIKEYS.md file${NC}"
    echo -e "${YELLOW}⚠️  This file contains sensitive API key information and should not be committed!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No APIKEYS.md file found${NC}"
fi

echo -e "\n${BLUE}2. Checking .gitignore configuration...${NC}"

if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ .gitignore file exists${NC}"
    
    # Check if important patterns are in .gitignore
    REQUIRED_PATTERNS=(".env" "node_modules" ".next" "*.key" "*.pem" "APIKEYS.md")
    
    for pattern in "${REQUIRED_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            echo -e "${GREEN}✅ Pattern '$pattern' found in .gitignore${NC}"
        else
            echo -e "${YELLOW}⚠️  Pattern '$pattern' missing from .gitignore${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo -e "${RED}❌ .gitignore file missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${BLUE}3. Checking for build artifacts...${NC}"

# Check for Next.js build files
if [ -d ".next" ]; then
    echo -e "${YELLOW}⚠️  Found .next directory (should be gitignored)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No .next directory found${NC}"
fi

# Check for node_modules
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Found node_modules directory (should be gitignored)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No node_modules directory found${NC}"
fi

echo -e "\n${BLUE}4. Checking for database files...${NC}"

if find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" | grep -q .; then
    echo -e "${RED}❌ Found database files:${NC}"
    find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No database files found${NC}"
fi

echo -e "\n${BLUE}5. Final recommendations...${NC}"

echo -e "\n${BLUE}Before committing to GitHub:${NC}"
echo "1. Remove or rename APIKEYS.md to something like APIKEYS.example.md"
echo "2. Ensure all .env files contain only placeholder values"
echo "3. Create .env.example files with placeholder values for documentation"
echo "4. Run 'git status' to verify no sensitive files are staged"
echo "5. Consider using tools like 'git-secrets' for additional protection"

echo -e "\n${BLUE}Summary:${NC}"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -gt 0 ]; then
    echo -e "\n${RED}❌ CRITICAL: Fix errors before committing to GitHub!${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  WARNING: Review warnings before committing${NC}"
    exit 0
else
    echo -e "\n${GREEN}✅ All checks passed! Safe to commit to GitHub${NC}"
    exit 0
fi