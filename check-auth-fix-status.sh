#!/bin/bash
set -e

# 🔧 Quick Auth & CSP Fix Deployment via Git Auto-Deploy
echo "================================================"
echo "🔧 Quick Auth Error & CSP Fix via Git Deploy"
echo "================================================"

echo "📋 Current Status Check..."

# Test signup endpoint (should work)
echo "🧪 Testing signup endpoint..."
SIGNUP_TEST=$(curl -s -w "%{http_code}" -X POST "https://onelastai.co/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"Test12345"}' -o /tmp/signup_test.json)
echo "Signup Status: $SIGNUP_TEST"
if [[ "$SIGNUP_TEST" =~ ^(201|409)$ ]]; then
    echo "✅ Signup endpoint working (201=created, 409=user exists)"
else
    echo "❌ Signup endpoint issue"
fi

# Test error endpoint (should be 404 currently)
echo ""
echo "🧪 Testing error endpoint..."
ERROR_TEST=$(curl -s -w "%{http_code}" "https://onelastai.co/api/auth/error?error=CredentialsSignin" -o /tmp/error_test.json)
echo "Error Endpoint Status: $ERROR_TEST"
if [ "$ERROR_TEST" = "404" ]; then
    echo "❌ Error endpoint missing (404) - needs deployment"
elif [ "$ERROR_TEST" = "200" ]; then
    echo "✅ Error endpoint working"
else
    echo "⚠️  Error endpoint unexpected status: $ERROR_TEST"
fi

echo ""
echo "📤 Triggering Git Auto-Deploy..."
echo "Our changes were pushed to GitHub main branch"
echo "If auto-deploy is configured, it should pick up changes automatically"

echo ""
echo "⏳ Waiting 30 seconds for potential auto-deployment..."
sleep 30

echo ""
echo "🔄 Re-testing endpoints after wait..."

# Re-test error endpoint
echo "🧪 Re-testing error endpoint..."
ERROR_TEST2=$(curl -s -w "%{http_code}" "https://onelastai.co/api/auth/error?error=CredentialsSignin" -o /tmp/error_test2.json)
echo "Error Endpoint Status: $ERROR_TEST2"

if [ "$ERROR_TEST2" = "200" ]; then
    echo "✅ SUCCESS! Error endpoint now working"
    cat /tmp/error_test2.json | head -3
elif [ "$ERROR_TEST2" = "404" ]; then
    echo "❌ Error endpoint still 404 - manual deployment needed"
    echo "The server may need manual restart or deployment"
else
    echo "⚠️  Error endpoint status: $ERROR_TEST2"
fi

echo ""
echo "📋 Summary Report:"
echo "=================="
echo ""

if [[ "$SIGNUP_TEST" =~ ^(201|409)$ ]]; then
    echo "✅ Signup API: Working properly"
else
    echo "❌ Signup API: Issue detected"
fi

if [ "$ERROR_TEST2" = "200" ]; then
    echo "✅ Error API: Working properly"
    echo "✅ CSP Headers: Should be updated (Next.js config deployed)"
else
    echo "❌ Error API: Still needs deployment"
    echo "⚠️  CSP Headers: May not be active yet"
fi

echo ""
echo "🚀 Next Steps:"
if [ "$ERROR_TEST2" = "200" ]; then
    echo "1. ✅ Test signup at https://onelastai.co/auth/signup"
    echo "2. ✅ Check browser console - CSP errors should be gone"  
    echo "3. ✅ All auth error messages should display properly"
else
    echo "1. 🔄 Wait for auto-deployment or manually restart server"
    echo "2. 🔄 Re-run this script to check status"
    echo "3. 📧 Contact server admin if auto-deploy not configured"
fi

echo ""
echo "================================================"
echo "✅ Auth Error & CSP Fix Check Complete"
echo "================================================"