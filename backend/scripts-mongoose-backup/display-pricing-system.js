import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Plan from './models/Plan.ts'
import Coupon from './models/Coupon.ts'
import Subscription from './models/Subscription.ts'
import Agent from './models/Agent.ts'

dotenv.config()

async function displayFinalPricingSystem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const plans = await Plan.find({}).sort({ 'pricing.amount': 1 })
    const coupons = await Coupon.find({})
    const subscriptions = await Subscription.find({}).populate('plan')
    const agents = await Agent.find({})
    
    console.log('\\n🎯 SIMPLE AGENT PRICING SYSTEM\\n')
    
    console.log('💰 Pricing Plans (Per Agent):')
    plans.forEach(plan => {
      const price = (plan.pricing.amount / 100).toFixed(2)
      console.log(`   • ${plan.displayName}: $${price}/${plan.billingPeriod}`)
      console.log(`     ${plan.description}`)
    })
    
    console.log('\\n🎫 Available Coupons:')
    coupons.forEach(coupon => {
      console.log(`   • ${coupon.code}: ${coupon.discount.percentage}% off - ${coupon.description}`)
    })
    
    console.log('\\n🤖 Available Agents:')
    agents.forEach(agent => {
      console.log(`   • ${agent.name} (${agent.category})`)
    })
    
    console.log('\\n📋 Sample Subscriptions:')
    subscriptions.forEach(sub => {
      const price = sub.billing ? (sub.billing.amount / 100).toFixed(2) : '0.00'
      console.log(`   • Agent: ${sub.agentName}`)
      console.log(`     Plan: ${sub.plan?.displayName || 'Unknown'} ($${price})`)
      console.log(`     Status: ${sub.status}`)
    })
    
    console.log('\\n🎯 How It Works:')
    console.log('   1. Users browse available AI agents')
    console.log('   2. Each agent has same pricing: $1 daily, $5 weekly, $15 monthly')
    console.log('   3. Users can subscribe to individual agents one by one')
    console.log('   4. Multiple agents = multiple subscriptions')
    console.log('   5. No free tier - pay per agent access')
    
    console.log('\\n📊 Database Summary:')
    console.log(`   • ${plans.length} pricing plans`)
    console.log(`   • ${coupons.length} discount coupons`) 
    console.log(`   • ${agents.length} available agents`)
    console.log(`   • ${subscriptions.length} active subscriptions`)
    
    console.log('\\n🚀 Ready for Integration:')
    console.log('   ✅ Database models created and populated')
    console.log('   ✅ Simple per-agent pricing structure') 
    console.log('   ✅ API routes ready (need to fix import issue)')
    console.log('   🔄 Frontend integration needed')
    console.log('   🔄 Payment processing integration needed')
    
    await mongoose.disconnect()
    console.log('\\n👋 Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

displayFinalPricingSystem()