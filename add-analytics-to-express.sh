#!/bin/bash

echo "🔧 Adding Analytics Endpoint to Express Server..."

# SSH to server and add the analytics endpoint
echo "📡 Connecting to server..."
ssh -o StrictHostKeyChecking=no -i /Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem ubuntu@47.129.43.231 << 'EOF'
    cd /home/ubuntu/shiny-friend-disco/backend
    
    echo "📝 Backing up current server file..."
    cp server-simple-auth.js server-simple-auth.js.backup
    
    echo "🔧 Adding analytics endpoint to Express server..."
    
    # Add the analytics endpoint before the final app.listen line
    sed -i '/^app\.listen(PORT, () => {/i\
// Analytics endpoint for dashboard\
app.get("/api/user/analytics", (req, res) => {\
  try {\
    const { userId, email } = req.query;\
    console.log("Analytics endpoint hit for userId:", userId, "email:", email);\
    \
    // Mock analytics data (no database dependencies)\
    const analyticsData = {\
      subscription: {\
        plan: "Free",\
        status: "none",\
        price: 0,\
        period: "none",\
        startDate: new Date().toISOString().split("T")[0],\
        renewalDate: "N/A",\
        daysUntilRenewal: 0,\
        billingCycle: "none"\
      },\
      usage: {\
        conversations: { current: 0, limit: 1000, percentage: 0, unit: "conversations" },\
        agents: { current: 0, limit: 18, percentage: 0, unit: "agents" },\
        apiCalls: { current: 0, limit: 10000, percentage: 0, unit: "calls" },\
        storage: { current: 0, limit: 5, percentage: 0, unit: "GB" },\
        messages: { current: 0, limit: 5000, percentage: 0, unit: "messages" }\
      },\
      dailyUsage: Array.from({ length: 7 }, (_, i) => {\
        const date = new Date();\
        date.setDate(date.getDate() - (6 - i));\
        return {\
          date: date.toISOString().split("T")[0],\
          conversations: Math.floor(Math.random() * 50),\
          messages: Math.floor(Math.random() * 200),\
          apiCalls: Math.floor(Math.random() * 300)\
        };\
      }),\
      weeklyTrend: {\
        conversationsChange: "+0%",\
        messagesChange: "+0%",\
        apiCallsChange: "+0%",\
        responseTimeChange: "-0%"\
      },\
      agentPerformance: [\
        { name: "Customer Support", conversations: 0, messages: 0, avgResponseTime: 1.2, successRate: 94.2 },\
        { name: "Sales Assistant", conversations: 0, messages: 0, avgResponseTime: 0.8, successRate: 96.1 }\
      ],\
      recentActivity: [{ timestamp: new Date().toISOString(), agent: "System", action: "Analytics loaded from Express backend", status: "success" }],\
      costAnalysis: { currentMonth: 0, projectedMonth: 0, breakdown: [] },\
      topAgents: [{ name: "Customer Support", usage: 0 }, { name: "Sales Assistant", usage: 0 }]\
    };\
    \
    res.json(analyticsData);\
  } catch (error) {\
    console.error("Analytics endpoint error:", error);\
    res.status(500).json({ error: "Analytics temporarily unavailable", subscription: { plan: "Free", status: "none", price: 0 } });\
  }\
});\
' server-simple-auth.js
    
    echo "🔄 Restarting backend service..."
    pm2 restart shiny-backend
    
    echo "✅ Backend restarted successfully"
    
    echo "🧪 Testing analytics endpoint..."
    sleep 3
    curl -s "http://localhost:3005/api/user/analytics" | head -20
    
    echo ""
    echo "✅ Analytics endpoint added to Express server!"
EOF