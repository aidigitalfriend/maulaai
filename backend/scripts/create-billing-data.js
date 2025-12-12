import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.ts';
import Plan from './models/Plan.ts';
import Subscription from './models/Subscription.ts';
import Payment from './models/Payment.ts';
import Billing from './models/Billing.ts';
import Invoice from './models/InvoiceFixed.ts';

dotenv.config();

async function createBillingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get sample data
    const sampleUser = (await User.findOne()) || {
      _id: new mongoose.Types.ObjectId(),
    };
    const dailyPlan = await Plan.findOne({ billingPeriod: 'daily' });
    const weeklyPlan = await Plan.findOne({ billingPeriod: 'weekly' });
    const monthlyPlan = await Plan.findOne({ billingPeriod: 'monthly' });

    if (!dailyPlan || !weeklyPlan || !monthlyPlan) {
      console.log(
        '❌ Plans not found. Please run create-pricing-data.js first.'
      );
      return;
    }

    console.log('📦 Creating sample billing and subscription data...');

    // Create sample subscription
    const subscription = new Subscription({
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
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      usage: {
        current: {
          apiCalls: 450,
          storage: 2.5,
        },
      },
      metadata: {
        planKey: 'monthly',
        agentSubscription: true,
      },
    });
    await subscription.save();
    console.log('✅ Created sample subscription');

    // Create sample payment
    const payment = new Payment({
      user: sampleUser._id,
      subscription: subscription._id,
      amount: monthlyPlan.pricing.amount,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      processor: 'stripe',
      transactionId: 'agent_monthly_' + Date.now(),
      processedAt: new Date(),
      metadata: {
        planType: 'monthly',
        billingPeriod: 'monthly',
      },
    });
    await payment.save();
    console.log('✅ Created sample payment');

    // Create sample billing record
    const billing = new Billing({
      user: sampleUser._id,
      subscription: subscription._id,
      plan: monthlyPlan._id,
      billingPeriod: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 'monthly',
        periodNumber: 1,
        isPartial: false,
      },
      status: 'completed',
      financial: {
        baseAmount: monthlyPlan.pricing.amount,
        usageCharges: 0,
        subtotal: monthlyPlan.pricing.amount,
        totalAmount: monthlyPlan.pricing.amount,
        amountDue: 0,
        amountPaid: monthlyPlan.pricing.amount,
        currency: 'USD',
      },
      usage: {
        metrics: [
          {
            name: 'api_calls',
            displayName: 'API Calls',
            unit: 'calls',
            quantity: 450,
            includedQuantity: 15000,
            overageQuantity: 0,
            unitPrice: 0,
            totalCharge: 0,
          },
        ],
        totalUnits: 450,
        totalOverage: 0,
        usagePercentage: 3,
      },
      payment: {
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
      },
      lineItems: [
        {
          type: 'subscription',
          description: 'Monthly Agent Access - Subscription',
          quantity: 1,
          unitPrice: monthlyPlan.pricing.amount,
          amount: monthlyPlan.pricing.amount,
          planId: monthlyPlan._id,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
    });
    await billing.save();
    console.log('✅ Created sample billing record');

    // Create sample invoice
    const invoice = new Invoice({
      user: sampleUser._id,
      subscription: subscription._id,
      billing: billing._id,
      status: 'paid',
      financial: {
        lineItems: [
          {
            description: 'Monthly Agent Access - Subscription',
            quantity: 1,
            unitPrice: monthlyPlan.pricing.amount,
            amount: monthlyPlan.pricing.amount,
            type: 'subscription',
            planId: monthlyPlan._id,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            taxable: false,
            taxRate: 0,
            taxAmount: 0,
          },
        ],
        subtotal: monthlyPlan.pricing.amount,
        discountTotal: 0,
        taxTotal: 0,
        total: monthlyPlan.pricing.amount,
        amountDue: 0,
        amountPaid: monthlyPlan.pricing.amount,
        currency: 'USD',
      },
      dates: {
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidDate: new Date(),
        serviceStart: new Date(),
        serviceEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      customer: {
        name: sampleUser.name || 'Sample User',
        email: sampleUser.email || 'user@example.com',
      },
      payments: [
        {
          paymentId: payment._id,
          amount: monthlyPlan.pricing.amount,
          method: 'card',
          processor: 'stripe',
          paidAt: new Date(),
          status: 'completed',
        },
      ],
    });
    await invoice.save();
    console.log('✅ Created sample invoice');

    // Create a sample weekly subscription in past_due status
    const weeklySubscription = new Subscription({
      user: sampleUser._id,
      plan: weeklyPlan._id,
      status: 'past_due',
      billing: {
        interval: 'week',
        intervalCount: 1,
        amount: weeklyPlan.pricing.amount,
        currency: weeklyPlan.pricing.currency,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        currentPeriodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      usage: {
        current: {
          apiCalls: 1200,
          storage: 1.2,
        },
      },
    });
    await weeklySubscription.save();
    console.log('✅ Created sample weekly past_due subscription');

    // Display summary
    const subscriptionCount = await Subscription.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const billingCount = await Billing.countDocuments();
    const invoiceCount = await Invoice.countDocuments();

    console.log('\\n🎉 All billing data created successfully!');
    console.log(`📊 Created:`);
    console.log(`   • ${subscriptionCount} subscriptions`);
    console.log(`   • ${paymentCount} payments`);
    console.log(`   • ${billingCount} billing records`);
    console.log(`   • ${invoiceCount} invoices`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
  }
}

createBillingData();
