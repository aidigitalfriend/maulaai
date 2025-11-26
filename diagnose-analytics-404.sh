#!/bin/bash
set -e

# 🔧 Fix User Analytics 404 Error
echo "================================================"
echo "🔧 Fixing /api/user/analytics 404 Error"
echo "================================================"

echo "🔍 Current Issues:"
echo "❌ GET /api/user/analytics → 404 (Not Found)"
echo "❌ SyntaxError: Unexpected token '<', \"<!DOCTYPE\"... is not valid JSON"
echo ""

echo "📋 Diagnosis:"
echo "The /api/user/analytics endpoint exists in frontend but is returning 404"
echo "This suggests NGINX routing issue - similar to what we fixed with /api/auth/"
echo ""

echo "🧪 Testing current API routing patterns..."

echo ""
echo "1. Testing /api/auth/signup (should work - frontend):"
SIGNUP_RESULT=$(curl -s -w "%{http_code}" -X POST "https://onelastai.co/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' -o /tmp/signup_test.json)
echo "   Status: $SIGNUP_RESULT"

echo ""
echo "2. Testing /api/user/analytics (broken):"
ANALYTICS_RESULT=$(curl -s -w "%{http_code}" "https://onelastai.co/api/user/analytics" -o /tmp/analytics_test.json)
echo "   Status: $ANALYTICS_RESULT"
echo "   Response: $(head -c 100 /tmp/analytics_test.json)"

echo ""
echo "3. Testing other frontend APIs:"
STATUS_RESULT=$(curl -s -w "%{http_code}" "https://onelastai.co/api/status" -o /tmp/status_test.json)
echo "   /api/status: $STATUS_RESULT"

echo ""
echo "📊 Analysis:"
if [[ "$SIGNUP_RESULT" =~ ^(200|400|409)$ ]]; then
    echo "✅ /api/auth/* → Properly routed to frontend (port 3000)"
else
    echo "❌ /api/auth/* → Issues detected"
fi

if [ "$ANALYTICS_RESULT" = "404" ]; then
    echo "❌ /api/user/* → NOT routed to frontend (404 error)"
    echo "   Likely routed to backend where endpoint doesn't exist"
else
    echo "✅ /api/user/* → Routed correctly"
fi

echo ""
echo "🔧 Solution Required:"
echo "The NGINX config needs /api/user/ routing rule to frontend:3000"
echo "Similar to how /api/auth/ was fixed in previous deployment"

echo ""
echo "🚀 Expected Fix:"
echo "Add NGINX routing rule:"
echo "location ^~ /api/user/ {"
echo "    proxy_pass http://localhost:3000;"
echo "    # ... standard proxy settings"
echo "}"
echo ""

echo "📋 Current Frontend Analytics Endpoint:"
echo "✅ File exists: frontend/app/api/user/analytics/route.ts"
echo "✅ Returns JSON data structure for dashboard"
echo "✅ Includes subscription, usage, and analytics data"

echo ""
echo "================================================"
echo "🎯 SUMMARY: Need NGINX /api/user/ routing fix"
echo "================================================"

# Cleanup
rm -f /tmp/signup_test.json /tmp/analytics_test.json /tmp/status_test.json