#!/bin/bash

# =================================================
# Server Status Check Script
# =================================================

SERVER="ubuntu@47.129.43.231"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🔍 Checking production server status..."
echo ""

echo "1️⃣ Testing server connectivity..."
if ping -c 1 47.129.43.231 >/dev/null 2>&1; then
    echo "✅ Server is reachable via ping"
else
    echo "❌ Server ping failed (might be disabled)"
fi

echo ""
echo "2️⃣ Testing website response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://onelastai.co" --connect-timeout 10)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Website is responding (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "522" ]; then
    echo "❌ Server timeout (HTTP $HTTP_CODE) - Backend server is down"
else
    echo "⚠️  Website returned HTTP $HTTP_CODE"
fi

echo ""
echo "3️⃣ Testing SSH connectivity..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes -i "$SSH_KEY_FILE" "$SERVER" "echo 'SSH OK'" 2>/dev/null; then
    echo "✅ SSH connection successful"
    echo ""
    echo "4️⃣ Checking server services..."
    ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
echo "📊 PM2 Status:"
pm2 list
echo ""
echo "💾 Disk Usage:"
df -h / | tail -1
echo ""
echo "🧠 Memory Usage:"
free -h | head -2
echo ""
echo "📈 System Load:"
uptime
EOF
else
    echo "❌ SSH connection failed"
    echo ""
    echo "🔧 Possible issues:"
    echo "   - Server is down"
    echo "   - SSH service stopped"
    echo "   - Network connectivity issues"
    echo "   - SSH key authentication problems"
fi

echo ""
echo "🩺 Diagnosis complete"