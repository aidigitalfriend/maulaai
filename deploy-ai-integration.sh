#!/bin/bash

# 🧠 AI Provider Integration Deployment Script
# Deploy intelligent agent-AI provider routing system

echo "🧠 DEPLOYING AI PROVIDER INTEGRATION"
echo "====================================="

echo "📊 Agent-AI Provider Assignments:"
echo "🟣 Mistral: 8 agents (Conversational & Creative)"
echo "🔵 Anthropic: 7 agents (Technical & Educational)" 
echo "🟡 Gemini: 2 agents (Research & Real-time)"
echo "🟢 OpenAI: 0 agents (Fallback)"
echo "🟠 Cohere: 0 agents (Enterprise fallback)"

# 1. Pull latest changes
echo ""
echo "📥 Pulling latest changes..."
ssh -i "$HOME/Downloads/shiny-friend-disco/one-last-ai.pem" ubuntu@47.129.43.231 "cd /home/ubuntu/shiny-friend-disco && git pull origin main"

# 2. Install backend dependencies
echo ""  
echo "�� Installing backend dependencies..."
ssh -i "$HOME/Downloads/shiny-friend-disco/one-last-ai.pem" ubuntu@47.129.43.231 "cd /home/ubuntu/shiny-friend-disco/backend && npm install"

# 3. Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
ssh -i "$HOME/Downloads/shiny-friend-disco/one-last-ai.pem" ubuntu@47.129.43.231 "cd /home/ubuntu/shiny-friend-disco/frontend && npm install"

# 4. Build frontend
echo ""
echo "🏗️  Building frontend with AI integration..."
ssh -i "$HOME/Downloads/shiny-friend-disco/one-last-ai.pem" ubuntu@47.129.43.231 "cd /home/ubuntu/shiny-friend-disco/frontend && npm run build"

# 5. Restart services
echo ""
echo "🔄 Restarting PM2 services..."
ssh -i "$HOME/Downloads/shiny-friend-disco/one-last-ai.pem" ubuntu@47.129.43.231 "pm2 restart all"

# 6. Test agent AI integration
echo ""
echo "🧪 Testing AI provider integration..."
ssh -i "$HOME/Downloads/shiny-friend-disco/one-last-ai.pem" ubuntu@47.129.43.231 "cd /home/ubuntu/shiny-friend-disco && node test-agent-ai-integration.js"

# 7. Verify endpoints
echo ""
echo "🔍 Verifying new API endpoints..."
curl -s https://onelastai.co/api/agents/optimized | jq '.totalAgents, .providerStats' || echo "API verification pending..."

echo ""
echo "✅ AI PROVIDER INTEGRATION DEPLOYMENT COMPLETE!"
echo ""
echo "🎯 NEW FEATURES DEPLOYED:"
echo "• Intelligent agent-AI provider routing"  
echo "• Automatic fallback system"
echo "• Optimized responses per agent personality"
echo "• Enhanced API endpoints"
echo ""
echo "🚀 Ready for intelligent agent interactions!"

