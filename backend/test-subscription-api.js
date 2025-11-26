import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function testAgentSubscriptionAPI() {
  try {
    console.log('🧪 Testing Agent Subscription API...\n')
    
    // Test 1: Get pricing plans
    console.log('1. Testing /api/subscriptions/pricing')
    const pricingResponse = await fetch('http://localhost:3005/api/subscriptions/pricing')
    
    if (pricingResponse.ok) {
      const pricingData = await pricingResponse.json()
      console.log('✅ Pricing API works!')
      console.log(`   Found ${pricingData.data.plans.length} pricing plans`)
      pricingData.data.plans.forEach(plan => {
        console.log(`   • ${plan.displayName}: ${plan.priceFormatted}/${plan.period}`)
      })
    } else {
      console.log('❌ Pricing API failed:', pricingResponse.status)
    }
    
    console.log()
    
    // Test 2: Get available agents
    console.log('2. Testing /api/subscriptions/agents')
    const agentsResponse = await fetch('http://localhost:3005/api/subscriptions/agents')
    
    if (agentsResponse.ok) {
      const agentsData = await agentsResponse.json()
      console.log('✅ Agents API works!')
      console.log(`   Found ${agentsData.data.totalAgents} available agents`)
      agentsData.data.agents.forEach(agent => {
        console.log(`   • ${agent.name} (${agent.category})`)
      })
    } else {
      console.log('❌ Agents API failed:', agentsResponse.status)
    }
    
    console.log()
    
    // Test 3: Check if server is running
    console.log('3. Testing server health')
    try {
      const healthResponse = await fetch('http://localhost:3005/api/subscriptions/pricing')
      console.log('✅ Server is running and API is accessible')
    } catch (error) {
      console.log('❌ Server is not running. Please start with: node server-simple.js')
    }
    
    console.log('\\n🎯 API Endpoints Available:')
    console.log('   • GET  /api/subscriptions/pricing         - Get pricing plans')
    console.log('   • GET  /api/subscriptions/agents          - Get available agents')
    console.log('   • GET  /api/subscriptions/:userId         - Get user subscriptions')
    console.log('   • POST /api/subscriptions/subscribe       - Subscribe to agent')
    console.log('   • DEL  /api/subscriptions/unsubscribe/:id - Cancel subscription')
    console.log('   • GET  /api/subscriptions/access/:userId/:agentId - Check access')
    console.log('   • POST /api/subscriptions/validate-coupon - Validate coupon code')
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message)
  }
}

// If server is not running, show how to start it
console.log('🚀 Agent Subscription System - API Test\\n')
console.log('💡 To test the API, first start the server:')
console.log('   cd /Users/onelastai/Downloads/shiny-friend-disco/backend')
console.log('   node server-simple.js')
console.log('\\n   Then run this test again.\\n')

testAgentSubscriptionAPI()