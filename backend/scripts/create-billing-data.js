import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.ts'
import Plan from './models/Plan.ts'
import Subscription from './models/Subscription.ts'
import Payment from './models/Payment.ts'
import Billing from './models/Billing.ts'
import Invoice from './models/InvoiceFixed.ts'

dotenv.config()

async function createBillingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get sample data
    const sampleUser = await User.findOne() || { _id: new mongoose.Types.ObjectId() }
    const freePlan = await Plan.findOne({ type: 'free' })
    const proPlan = await Plan.findOne({ type: 'pro' })
    
    if (!freePlan || !proPlan) {
      console.log('❌ Plans not found. Please run create-pricing-data.js first.')
      return
    }
    
    console.log('📦 Creating sample billing and subscription data...')
    
    // Create sample subscription
    const subscription = new Subscription({
      user: sampleUser._id,
      plan: freePlan._id,
      status: 'active',
      billing: {
        interval: 'month',
        intervalCount: 1,
        amount: freePlan.pricing.amount,
        currency: freePlan.pricing.currency,
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      usage: {
        current: {
          apiCalls: 25,
          storage: 0.5
        }
      }
    })
    await subscription.save()
    console.log('✅ Created sample subscription')
    
    // Create sample payment
    const payment = new Payment({
      user: sampleUser._id,
      subscription: subscription._id,
      amount: 0, // Free plan
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'free_plan',
      processor: 'system',
      transactionId: 'free_' + Date.now(),
      processedAt: new Date(),
      metadata: {
        planType: 'free',
        billingPeriod: 'monthly'
      }
    })
    await payment.save()
    console.log('✅ Created sample payment')
    
    // Create sample billing record
    const billing = new Billing({
      user: sampleUser._id,
      subscription: subscription._id,
      plan: freePlan._id,
      billingPeriod: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 'monthly',
        periodNumber: 1,
        isPartial: false
      },
      status: 'completed',
      financial: {
        baseAmount: 0,
        usageCharges: 0,
        subtotal: 0,
        totalAmount: 0,
        amountDue: 0,
        amountPaid: 0,
        currency: 'USD'
      },
      usage: {
        metrics: [{
          name: 'api_calls',
          displayName: 'API Calls',
          unit: 'calls',
          quantity: 25,
          includedQuantity: 100,
          overageQuantity: 0,
          unitPrice: 0,
          totalCharge: 0
        }],
        totalUnits: 25,
        totalOverage: 0,
        usagePercentage: 25
      },
      payment: {
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidAt: new Date()
      },
      lineItems: [{
        type: 'subscription',
        description: 'Free Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        planId: freePlan._id,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }]
    })
    await billing.save()
    console.log('✅ Created sample billing record')
    
    // Create sample invoice
    const invoice = new Invoice({
      user: sampleUser._id,
      subscription: subscription._id,
      billing: billing._id,
      status: 'paid',
      financial: {
        lineItems: [{
          description: 'Free Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          type: 'subscription',
          planId: freePlan._id,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          taxable: false,
          taxRate: 0,
          taxAmount: 0
        }],
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        total: 0,
        amountDue: 0,
        amountPaid: 0,
        currency: 'USD'
      },
      dates: {
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidDate: new Date(),
        serviceStart: new Date(),
        serviceEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      customer: {
        name: sampleUser.name || 'Sample User',
        email: sampleUser.email || 'user@example.com'
      },
      payments: [{
        paymentId: payment._id,
        amount: 0,
        method: 'free_plan',
        processor: 'system',
        paidAt: new Date(),
        status: 'completed'
      }]
    })
    await invoice.save()
    console.log('✅ Created sample invoice')
    
    // Create a Pro subscription example
    const proSubscription = new Subscription({
      user: sampleUser._id,
      plan: proPlan._id,
      status: 'trial',
      billing: {
        interval: 'month',
        intervalCount: 1,
        amount: proPlan.pricing.amount,
        currency: proPlan.pricing.currency,
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
      },
      trial: {
        active: true,
        start: new Date(),
        end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        daysRemaining: 14
      },
      usage: {
        current: {
          apiCalls: 150,
          storage: 2.5
        }
      }
    })
    await proSubscription.save()
    console.log('✅ Created sample Pro trial subscription')
    
    // Display summary
    const subscriptionCount = await Subscription.countDocuments()
    const paymentCount = await Payment.countDocuments()
    const billingCount = await Billing.countDocuments()
    const invoiceCount = await Invoice.countDocuments()
    
    console.log('\\n🎉 All billing data created successfully!')
    console.log(`📊 Created:`)
    console.log(`   • ${subscriptionCount} subscriptions`)
    console.log(`   • ${paymentCount} payments`)
    console.log(`   • ${billingCount} billing records`)
    console.log(`   • ${invoiceCount} invoices`)
    
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    await mongoose.disconnect()
  }
}

createBillingData()