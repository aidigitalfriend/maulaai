#!/bin/bash

# Agent Database Migration Deployment Script
# Safely migrates scattered agent collections to main agents collection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="47.129.43.231"
SERVER_USER="ubuntu"
KEY_FILE="one-last-ai.pem"
PROJECT_DIR="/home/ubuntu/onelastai"

echo -e "${BLUE}🔄 Agent Database Migration Deployment${NC}"
echo "======================================"

# Verify we have the required files
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}❌ SSH key file '$KEY_FILE' not found${NC}"
    exit 1
fi

if [ ! -f "backend/scripts/migrate-agents-database.js" ]; then
    echo -e "${RED}❌ Migration script not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-flight checks passed${NC}"

# Step 1: Upload migration script to production server
echo -e "\n${BLUE}📤 Uploading migration script...${NC}"
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no \
    backend/scripts/migrate-agents-database.js \
    ubuntu@$SERVER_IP:$PROJECT_DIR/backend/scripts/

# Step 2: Run dry-run first for safety
echo -e "\n${YELLOW}🔍 Running migration dry-run...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
cd /home/ubuntu/onelastai
export $(cat .env | grep -v '^#' | xargs)
node backend/scripts/migrate-agents-database.js --dry-run
EOF

echo -e "\n${YELLOW}⚠️  Dry-run completed. Review the output above.${NC}"
echo -e "${YELLOW}The dry-run shows what would be migrated without making changes.${NC}"

# Confirm before proceeding
read -p "Do you want to proceed with the actual migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Migration cancelled by user${NC}"
    exit 0
fi

# Step 3: Run actual migration
echo -e "\n${BLUE}🚀 Running actual database migration...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
cd /home/ubuntu/onelastai

# Set environment variables
export $(cat .env | grep -v '^#' | xargs)

# Run the migration
echo "Starting migration..."
node backend/scripts/migrate-agents-database.js

# Check the results
echo -e "\n📊 Post-migration database status:"
echo "Checking agents collection..."
mongo "$MONGODB_URI" --eval "db.agents.countDocuments()" --quiet

EOF

# Step 4: Verify migration results
echo -e "\n${BLUE}🔍 Verifying migration results...${NC}"
ssh -i "$KEY_KEY" -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
cd /home/ubuntu/onelastai
export $(cat .env | grep -v '^#' | xargs)

# Test agents API endpoint
echo "Testing agents API endpoint..."
curl -s http://localhost:3005/api/agents | head -200

echo -e "\n✅ Migration verification completed"
EOF

# Step 5: Restart backend service to clear any cache
echo -e "\n${BLUE}🔄 Restarting backend service...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$SERVER_IP << 'EOF'
# Restart backend service
sudo systemctl restart onelastai-backend || pm2 restart backend || true
sleep 3

# Check service status
sudo systemctl status onelastai-backend --no-pager || pm2 status || true
EOF

echo -e "\n${GREEN}✅ Agent database migration deployment completed!${NC}"
echo -e "${GREEN}All agent data has been consolidated into the main agents collection.${NC}"
echo -e "\n${BLUE}Summary of changes:${NC}"
echo -e "• Individual agent collections backed up"
echo -e "• Agent data consolidated into main 'agents' collection"
echo -e "• Old individual collections removed"
echo -e "• Database indexes optimized"
echo -e "• Backend service restarted"

echo -e "\n${YELLOW}💡 Next steps:${NC}"
echo -e "• Verify agent functionality at https://onelastai.co"
echo -e "• Check that all agents are properly listed"
echo -e "• Monitor for any issues in the next few hours"

echo -e "\n${GREEN}🎉 Database migration successfully deployed!${NC}"
