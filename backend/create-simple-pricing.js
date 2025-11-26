import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.ts'
import Plan from './models/Plan.ts'
import Coupon from './models/Coupon.ts'
import Subscription from './models/Subscription.ts'
import Agent from './models/Agent.ts'

dotenv.config()

async function createSimplePricingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing pricing data
    await Plan.deleteMany({})
    await Coupon.deleteMany({})
    await Subscription.deleteMany({})
    console.log('🗑️  Cleared existing pricing data')
    
    // Get a sample user ID
    const sampleUser = await User.findOne() || { _id: new mongoose.Types.ObjectId() }
    
    // Create simple per-agent pricing plans
    console.log('💰 Creating simple per-agent pricing plans...')
    
    // Daily Plan - $1 per day per agent
    const dailyPlan = new Plan({
      name: 'Daily',
      displayName: 'Daily Access',
      description: '$1 per day per agent - Perfect for short-term projects',
      type: 'basic',
      category: 'individual',
      slug: 'daily-agent-access',
      billingPeriod: 'daily',
      price: { amount: 100, currency: 'USD' }, // $1.00 in cents
      pricing: { amount: 100, currency: 'USD' },
      features: {
        limits: {
          agentAccess: 1, // Access to 1 agent
          duration: '24 hours',
          apiCallsPerDay: 500
        },
        included: [
          'Full agent access for 24 hours',
          '500 API calls per day',
          'Standard response time',
          'Email support'
        ]
      },
      isActive: true,
      isPublic: true,
      createdBy: sampleUser._id,
      metadata: {
        perAgent: true,
        accessType: 'individual'
      }
    })
    await dailyPlan.save()
    console.log('✅ Created Daily Plan ($1/day per agent)')
    
    // Weekly Plan - $5 per week per agent
    const weeklyPlan = new Plan({
      name: 'Weekly', 
      displayName: 'Weekly Access',
      description: '$5 per week per agent - Great for weekly projects and testing',
      type: 'basic',
      category: 'individual',
      slug: 'weekly-agent-access',
      billingPeriod: 'weekly',
      price: { amount: 500, currency: 'USD' }, // $5.00 in cents
      pricing: { amount: 500, currency: 'USD' },
      features: {
        limits: {
          agentAccess: 1, // Access to 1 agent
          duration: '7 days',
          apiCallsPerWeek: 2500
        },
        included: [
          'Full agent access for 7 days', 
          '2,500 API calls per week',
          'Priority response time',
          'Email support',
          '20% savings vs daily'
        ]
      },
      isActive: true,
      isPublic: true,
      createdBy: sampleUser._id,
      metadata: {
        perAgent: true,
        accessType: 'individual',
        savings: '20% vs daily'
      }
    })
    await weeklyPlan.save()
    console.log('✅ Created Weekly Plan ($5/week per agent)')
    
    // Monthly Plan - $19 per month per agent
    const monthlyPlan = new Plan({
      name: 'Monthly',
      displayName: 'Monthly Access', 
      description: '$19 per month per agent - Best value for regular usage',
      type: 'pro',
      category: 'business',
      slug: 'monthly-agent-access',
      billingPeriod: 'monthly',
      price: { amount: 1900, currency: 'USD' }, // $19.00 in cents
      pricing: { amount: 1900, currency: 'USD' },
      features: {
        limits: {
          agentAccess: 1, // Access to 1 agent
          duration: '30 days', 
          apiCallsPerMonth: 15000
        },
        included: [
          'Full agent access for 30 days',
          '15,000 API calls per month',
          'Priority response time',
          'Email & chat support',
          '37% savings vs daily',
          'Advanced features included'
        ]
      },
      isActive: true,
      isPublic: true,
      createdBy: sampleUser._id,
      metadata: {
        perAgent: true,
        accessType: 'individual',
        savings: '37% vs daily',
        recommended: true
      }
    })
    await monthlyPlan.save()
    console.log('✅ Created Monthly Plan ($19/month per agent)')
    
    // Create simple welcome coupon
    const welcomeCoupon = new Coupon({
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off first agent subscription',
      type: 'percentage',
      discount: { percentage: 10 },
      status: 'active',
      validity: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      },
      usage: {
        maxUses: 1000,
        maxUsesPerCustomer: 1,
        usedCount: 0
      },
      applicability: {
        plans: [dailyPlan._id, weeklyPlan._id, monthlyPlan._id],
        userSegments: ['new_users'],
        subscriptionRules: {
          newSubscriptionsOnly: true,
          firstPaymentOnly: true
        }
      },
      management: {
        createdBy: sampleUser._id
      }
    })
    await welcomeCoupon.save()
    console.log('✅ Created Welcome Coupon (WELCOME10 - 10% off)')
    
    // Get available agents to create sample subscriptions
    const agents = await Agent.find().limit(3)
    console.log(`📋 Found ${agents.length} agents for sample subscriptions`)
    
    // Create sample individual agent subscriptions
    if (agents.length > 0) {
      const agent1 = agents[0]
      
      // Sample monthly subscription to first agent
      const agentSubscription = new Subscription({
        user: sampleUser._id,
        plan: monthlyPlan._id,
        status: 'active',
        billing: {
          interval: 'month',
          intervalCount: 1,
          amount: monthlyPlan.pricing.amount,
          currency: monthlyPlan.pricing.currency,
          startDate: new Date(),
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        agentId: agent1.agentId || agent1._id,
        agentName: agent1.name,
        usage: {
          current: {
            apiCalls: 450,
            totalSessions: 25
          }
        },
        metadata: {
          agentSubscription: true,
          agentDetails: {
            id: agent1.agentId || agent1._id,
            name: agent1.name,
            category: agent1.category
          }
        }
      })
      await agentSubscription.save()
      console.log(`✅ Created sample subscription for agent: ${agent1.name}`)
    }
    
    console.log('\\n🎉 Simple pricing system created successfully!')
    
    // Display pricing summary
    console.log('\\n💰 Pricing Summary:')
    console.log('   📅 Daily:   $1.00 per day per agent')
    console.log('   📅 Weekly:  $5.00 per week per agent (20% savings)')
    console.log('   📅 Monthly: $19.00 per month per agent (37% savings)')
    console.log('\\n🎯 How it works:')
    console.log('   • Users can subscribe to individual agents')
    console.log('   • Each agent has the same pricing options')
    console.log('   • Multiple agents = multiple subscriptions')
    console.log('   • No free tier, pay per agent access')
    
    // Final counts
    const planCount = await Plan.countDocuments()
    const couponCount = await Coupon.countDocuments()
    const subscriptionCount = await Subscription.countDocuments()
    
    console.log(`\\n📊 Created: ${planCount} plans, ${couponCount} coupons, ${subscriptionCount} subscriptions`)
    
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    await mongoose.disconnect()
  }
}

createSimplePricingData()