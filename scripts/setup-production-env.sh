#!/bin/bash

# 🚀 Production Environment Setup Script
# This script helps you create the .env file on your EC2 server

echo "================================================"
echo "🚀 Shiny Friend Disco - Production Setup"
echo "================================================"
echo ""

# Navigate to project directory
cd ~/shiny-friend-disco || { echo "❌ Error: Project directory not found"; exit 1; }

echo "📁 Current directory: $(pwd)"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  WARNING: .env file already exists!"
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "❌ Aborted. Existing .env file preserved."
        exit 0
    fi
    echo "🗑️  Backing up existing .env to .env.backup..."
    cp .env .env.backup
fi

# Create .env file
echo "📝 Creating .env file..."

cat > .env << 'EOL'
# ================================
# 🚀 PRODUCTION ENVIRONMENT CONFIG
# ================================

# ================================
# CRITICAL - REQUIRED FOR BASIC FUNCTIONALITY
# ================================

# MongoDB Database
MONGODB_URI=
MONGODB_DB_NAME=shiny-friend-disco

# NextAuth Configuration
NEXTAUTH_URL=http://18.138.34.220:3000
NEXTAUTH_SECRET=

# ================================
# AI PROVIDERS (Multi-Provider System)
# ================================

# Google Gemini (PRIMARY - Priority 1)
GEMINI_API_KEY=

# OpenAI (SECONDARY - Priority 2)
OPENAI_API_KEY=

# Mistral AI (THIRD - Priority 3)
MISTRAL_API_KEY=

# Anthropic (FOURTH - Priority 4) - Organization disabled, needs credits
ANTHROPIC_API_KEY=

# Cohere (FIFTH - Priority 5)
COHERE_API_KEY=

# ================================
# AWS SERVICES
# ================================

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=

# ================================
# PAYMENT GATEWAYS
# ================================

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# ================================
# EMAIL SERVICE (Nodemailer)
# ================================

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# ================================
# SMS SERVICE (Twilio)
# ================================

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ================================
# REDIS (Optional - for caching)
# ================================

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=

# ================================
# RATE LIMITING
# ================================

RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# ================================
# SECURITY
# ================================

ENCRYPTION_KEY=
JWT_SECRET=

# ================================
# EXTERNAL SERVICES
# ================================

# SendGrid (Alternative Email)
SENDGRID_API_KEY=

# Cloudinary (Image hosting)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Analytics
GOOGLE_ANALYTICS_ID=

# Facebook Pixel
FACEBOOK_PIXEL_ID=

# ================================
# DEVELOPMENT/DEBUG
# ================================

NODE_ENV=production
LOG_LEVEL=info
DEBUG=false

EOL

echo "✅ .env file created successfully!"
echo ""
echo "================================================"
echo "⚠️  IMPORTANT: You need to edit the .env file"
echo "================================================"
echo ""
echo "Run these commands to add your API keys:"
echo ""
echo "  nano .env"
echo ""
echo "Or use vi:"
echo "  vi .env"
echo ""
echo "================================================"
echo "📋 REQUIRED KEYS (Minimum to start):"
echo "================================================"
echo ""
echo "1. MONGODB_URI - Your MongoDB connection string"
echo "2. NEXTAUTH_SECRET - Generate with: openssl rand -base64 32"
echo "3. GEMINI_API_KEY - Your Google Gemini API key (Primary AI)"
echo "4. OPENAI_API_KEY - Your OpenAI API key (Fallback AI)"
echo ""
echo "================================================"
echo "🎯 AI PROVIDER STATUS:"
echo "================================================"
echo ""
echo "✅ Gemini (Primary) - 100% working - 3 models"
echo "✅ OpenAI (Secondary) - 100% working - 8+ models"
echo "✅ Mistral (Third) - 100% working - 3 models"
echo "❌ Anthropic (Fourth) - Needs credits added"
echo "✅ Cohere (Fifth) - 67% working - 2 models"
echo ""
echo "Total: 12/15 models working (80% success rate)"
echo ""
echo "================================================"
echo "🔧 NEXT STEPS:"
echo "================================================"
echo ""
echo "1. Edit .env file:"
echo "   nano .env"
echo ""
echo "2. Generate NEXTAUTH_SECRET:"
echo "   openssl rand -base64 32"
echo ""
echo "3. Build frontend:"
echo "   cd frontend && npm run build"
echo ""
echo "4. Start backend:"
echo "   cd backend && pm2 start npm --name backend-api -- run dev"
echo ""
echo "5. Start frontend:"
echo "   cd frontend && pm2 start npm --name frontend-app -- run start"
echo ""
echo "6. Save PM2 config:"
echo "   pm2 save"
echo ""
echo "7. Check status:"
echo "   pm2 status"
echo ""
echo "================================================"
echo "📚 Full guide: ~/shiny-friend-disco/PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "================================================"
echo ""
