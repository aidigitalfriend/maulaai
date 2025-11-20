#!/bin/bash

# 🎯 ACTIVATE UNIVERSAL TRACKING SYSTEM
# This script installs dependencies and starts the tracking-enabled server

echo "🎯 Activating Universal Tracking System..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install cookie-parser || echo "⚠️ cookie-parser may already be installed or network issue"

# Verify tracking files exist
echo "✅ Verifying tracking system files..."
if [ ! -f "models/Analytics.ts" ]; then
  echo "❌ Error: models/Analytics.ts not found"
  exit 1
fi

if [ ! -f "lib/analytics-tracker.ts" ]; then
  echo "❌ Error: lib/analytics-tracker.ts not found"
  exit 1
fi

if [ ! -f "lib/tracking-middleware.ts" ]; then
  echo "❌ Error: lib/tracking-middleware.ts not found"
  exit 1
fi

if [ ! -f "routes/analytics.js" ]; then
  echo "❌ Error: routes/analytics.js not found"
  exit 1
fi

echo "✅ All tracking files verified!"

# Check MongoDB connection
echo "🔍 Checking MongoDB Atlas connection..."
if grep -q "mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net" .env; then
  echo "✅ MongoDB Atlas connection configured"
else
  echo "⚠️ Warning: MongoDB Atlas connection may not be configured"
fi

# Start the server
echo "🚀 Starting real-time server with universal tracking..."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  UNIVERSAL TRACKING SYSTEM ACTIVATED"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 TRACKING CAPABILITIES:"
echo "  ✅ Visitors (cookie-based, 1-year persistence)"
echo "  ✅ Sessions (30-minute timeout)"
echo "  ✅ Page Views (with time spent, scroll depth)"
echo "  ✅ Chat Interactions (all AI conversations)"
echo "  ✅ Tool Usage (all 28 developer tools)"
echo "  ✅ Lab Experiments (all 12 AI experiments)"
echo "  ✅ User Events (signups, logins, payments)"
echo "  ✅ API Usage (every API call with timing)"
echo ""
echo "🌐 Server: http://localhost:3005"
echo "🔌 WebSocket: ws://localhost:3005"
echo "📡 API: http://localhost:3005/api/analytics"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Start server
node server-realtime.js
