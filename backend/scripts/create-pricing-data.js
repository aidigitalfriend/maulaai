import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from './models/Plan.ts';
import Coupon from './models/Coupon.ts';
import User from './models/User.ts';

dotenv.config();

async function createPricingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    // Clear existing data
    await Plan.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing pricing data');

    // Get a sample user ID
    const sampleUser = (await User.findOne()) || {
      _id: new mongoose.Types.ObjectId(),
    };

    const planConfigs = [
      {
        name: 'Daily',
        displayName: 'Daily Agent Access',
        description: '$1 per day per agent - perfect for short projects',
        slug: 'daily-agent-access',
        billingPeriod: 'daily',
        amount: 100,
        features: {
          limits: {
            agentAccess: 1,
            duration: '24 hours',
            apiCallsPerDay: 500,
          },
        },
        metadata: { savings: 'Pay-as-you-need', perAgent: true },
      },
      {
        name: 'Weekly',
        displayName: 'Weekly Agent Access',
        description: '$5 per week per agent - great for testing and sprints',
        slug: 'weekly-agent-access',
        billingPeriod: 'weekly',
        amount: 500,
        features: {
          limits: {
            agentAccess: 1,
            duration: '7 days',
            apiCallsPerWeek: 2500,
          },
        },
        metadata: { savings: '20% vs daily', perAgent: true },
      },
      {
        name: 'Monthly',
        displayName: 'Monthly Agent Access',
        description: '$19 per month per agent - best value for regular usage',
        slug: 'monthly-agent-access',
        billingPeriod: 'monthly',
        amount: 1900,
        features: {
          limits: {
            agentAccess: 1,
            duration: '30 days',
            apiCallsPerMonth: 15000,
          },
        },
        metadata: {
          savings: '37% vs daily',
          perAgent: true,
          recommended: true,
        },
      },
    ];

    const createdPlans = [];

    for (const config of planConfigs) {
      const plan = new Plan({
        name: config.name,
        displayName: config.displayName,
        description: config.description,
        type: 'per-agent',
        category: 'individual',
        slug: config.slug,
        billingPeriod: config.billingPeriod,
        price: { amount: config.amount, currency: 'USD' },
        pricing: {
          amount: config.amount,
          currency: 'USD',
          interval:
            config.billingPeriod === 'daily'
              ? 'day'
              : config.billingPeriod === 'weekly'
              ? 'week'
              : 'month',
        },
        features: config.features,
        metadata: config.metadata,
        isActive: true,
        isPublic: true,
        createdBy: sampleUser._id,
      });
      await plan.save();
      createdPlans.push(plan);
      console.log(`✅ Created ${config.displayName}`);
    }

    // Create Welcome Coupon
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
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
      usage: {
        maxUses: 1000,
        maxUsesPerCustomer: 1,
        usedCount: 0,
      },
      management: {
        createdBy: sampleUser._id,
      },
    });
    await coupon.save();
    console.log('✅ Created Welcome Coupon');

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
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      usage: {
        maxUses: 500,
        maxUsesPerCustomer: 1,
        usedCount: 0,
      },
      applicability: {
        plans: createdPlans.map((plan) => plan._id),
      },
      management: {
        createdBy: sampleUser._id,
      },
    });
    await holidayCoupon.save();
    console.log('✅ Created Holiday Coupon');

    console.log('\\n🎉 All pricing data created successfully!');

    // Display summary
    const planCount = await Plan.countDocuments();
    const couponCount = await Coupon.countDocuments();

    console.log(`📊 Created ${planCount} plans and ${couponCount} coupons`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createPricingData();
