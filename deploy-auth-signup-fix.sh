#!/bin/bash

# 🚀 Auth Signup Fix Deployment Script
# This script handles the complete deployment: commit, push, build, and restart services

set -e  # Exit on error

echo "======================================================"
echo "🔧 Auth Signup Fix Deployment Script"
echo "======================================================"
echo ""

# Step 1: Git Operations
echo "📋 Step 1: Git Operations"
echo "---"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Exiting."
    exit 1
fi

# Check git status
echo "Current branch: $(git branch --show-current)"
echo ""

# Stage all changes
echo "📝 Staging changes..."
git add -A
echo "✅ Changes staged"
echo ""

# Show what will be committed
echo "📊 Files to be committed:"
git diff --cached --name-only | sed 's/^/  - /'
echo ""

# Commit changes
echo "💾 Committing changes..."
git commit -m "🔧 Fix: Auth Signup API 404 - NGINX routing + frontend deps + dev scripts

- Fixed NGINX routing to properly handle /api/auth/* to frontend:3000
- Added bcryptjs dependency to frontend for password hashing
- Updated frontend signup endpoint to use @backend path alias
- Simplified backend auth.ts configuration
- Added nodemon for backend hot reload during development
- Updated root dev scripts for concurrent frontend:3100 + backend:watch
- Modernized Next.js image configuration with remotePatterns
- Added development guide (README-dev-live.md)

Files modified:
- nginx-onelastai-https.conf: Added priority /api/auth/ routing
- nginx-onelastai.conf: Added priority /api/auth/ routing  
- nginx-config.conf: Added priority /api/auth/ routing
- frontend/package.json: Added bcryptjs + @types/bcryptjs
- frontend/next.config.js: Updated image config + added webpack alias
- frontend/app/api/auth/signup/route.ts: Updated imports to @backend
- backend/package.json: Added nodemon + dev:watch script
- package.json: Updated dev script to run frontend:3100 + backend:watch
- backend/auth.ts: Simplified to password-only auth
- NEW: AUTH_SIGNUP_FIX_COMPLETE.md - Deployment documentation
- NEW: README-dev-live.md - Development workflow guide"

echo "✅ Changes committed"
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main
echo "✅ Pushed to main branch"
echo ""

# Step 2: Build Frontend Locally
echo "🏗️  Step 2: Build Frontend"
echo "---"

cd frontend

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building frontend..."
npm run build

echo "✅ Frontend built successfully"
echo ""

cd ..

# Step 3: Success Message
echo "======================================================"
echo "✅ LOCAL BUILD COMPLETE!"
echo "======================================================"
echo ""
echo "Next steps:"
echo "1. SSH into production server:"
echo "   ssh -i one-last-ai.pem ubuntu@47.129.43.231"
echo ""
echo "2. Run production deployment:"
echo "   cd ~/shiny-friend-disco"
echo "   bash deploy-auth-signup-fix-production.sh"
echo ""
echo "======================================================"
