import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Plan from './models/Plan.ts'
import Coupon from './models/Coupon.ts'
import User from './models/User.ts'

dotenv.config()

async function createPricingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing data
    await Plan.deleteMany({})
    await Coupon.deleteMany({})
    console.log('🗑️  Cleared existing pricing data')
    
    // Get a sample user ID
    const sampleUser = await User.findOne() || { _id: new mongoose.Types.ObjectId() }
    
    // Create Free Plan
    const freePlan = new Plan({
      name: 'Free',
      displayName: 'Free Plan',
      description: 'Basic AI access with limited usage',
      type: 'free',
      category: 'individual',
      slug: 'free-plan',
      billingPeriod: 'monthly',
      price: { amount: 0, currency: 'USD' },
      pricing: { amount: 0, currency: 'USD' },
      features: { 
        limits: { 
          apiCallsPerMonth: 100, 
          storageGB: 1,
          maxAgents: 1
        }
      },
      isActive: true,
      isPublic: true,
      createdBy: sampleUser._id
    })
    await freePlan.save()
    console.log('✅ Created Free Plan')
    
    // Create Pro Plan
    const proPlan = new Plan({
      name: 'Pro',
      displayName: 'Pro Plan', 
      description: 'Advanced AI features for power users',
      type: 'pro',
      category: 'business',
      slug: 'pro-plan',
      billingPeriod: 'monthly',
      price: { amount: 2900, currency: 'USD' }, // $29.00
      pricing: { amount: 2900, currency: 'USD' },
      features: {
        limits: {
          apiCallsPerMonth: 10000,
          storageGB: 50, 
          maxAgents: 10
        }
      },
      isActive: true,
      isPublic: true,
      createdBy: sampleUser._id
    })
    await proPlan.save()
    console.log('✅ Created Pro Plan')
    
    // Create Enterprise Plan
    const enterprisePlan = new Plan({
      name: 'Enterprise',
      displayName: 'Enterprise Plan',
      description: 'Unlimited AI access for teams and organizations',
      type: 'enterprise',
      category: 'enterprise',
      slug: 'enterprise-plan',
      billingPeriod: 'monthly',
      price: { amount: 9900, currency: 'USD' }, // $99.00
      pricing: { amount: 9900, currency: 'USD' },
      features: {
        limits: {
          apiCallsPerMonth: -1, // Unlimited
          storageGB: 500,
          maxAgents: -1 // Unlimited
        }
      },
      isActive: true,
      isPublic: true,
      createdBy: sampleUser._id
    })
    await enterprisePlan.save()
    console.log('✅ Created Enterprise Plan')
    
    // Create Welcome Coupon
    const coupon = new Coupon({
      code: 'WELCOME25',
      name: 'Welcome Discount',
      description: '25% off first month for new users',
      type: 'percentage',
      discount: { percentage: 25 },
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
      management: {
        createdBy: sampleUser._id
      }
    })
    await coupon.save()
    console.log('✅ Created Welcome Coupon')
    
    // Create Holiday Coupon
    const holidayCoupon = new Coupon({
      code: 'HOLIDAY50',
      name: 'Holiday Special',
      description: '50% off Pro and Enterprise plans',
      type: 'percentage',
      discount: { percentage: 50 },
      status: 'active',
      validity: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      usage: {
        maxUses: 500,
        maxUsesPerCustomer: 1,
        usedCount: 0
      },
      applicability: {
        plans: [proPlan._id, enterprisePlan._id]
      },
      management: {
        createdBy: sampleUser._id
      }
    })
    await holidayCoupon.save()
    console.log('✅ Created Holiday Coupon')
    
    console.log('\\n🎉 All pricing data created successfully!')
    
    // Display summary
    const planCount = await Plan.countDocuments()
    const couponCount = await Coupon.countDocuments()
    
    console.log(`📊 Created ${planCount} plans and ${couponCount} coupons`)
    
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    await mongoose.disconnect()
  }
}

createPricingData()