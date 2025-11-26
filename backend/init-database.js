#!/usr/bin/env node

/**
 * Database Collections Initializer and Tester
 * This script creates all necessary collections and adds sample data
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') })

// Import all models
import User from './models/User.ts'
import JobApplication from './models/JobApplication.ts'
import ContactMessage from './models/ContactMessage.ts'
import CommunityPost from './models/CommunityPost.ts'
import CommunityComment from './models/CommunityComment.ts'
import CommunityLike from './models/CommunityLike.ts'
import Subscription from './models/Subscription.ts'
import Presence from './models/Presence.ts'
import Notification from './models/Notification.ts'
import EmailQueue from './models/EmailQueue.ts'
import Agent from './models/Agent.ts'

// Pricing and Subscription Models
import Plan from './models/Plan.ts'
import Payment from './models/Payment.ts'
import Coupon from './models/Coupon.ts'
import Billing from './models/Billing.ts'
import Invoice from './models/InvoiceFixed.ts'
import { 
  Visitor, 
  PageView, 
  ChatInteraction, 
  ToolUsage, 
  LabExperiment, 
  UserEvent, 
  Session, 
  ApiUsage 
} from './models/Analytics.ts'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  process.exit(1)
}

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

async function initializeCollections() {
  console.log('\n🔧 Initializing Database Collections...\n')

  const collections = [
    { name: 'users', model: User, description: 'User authentication and profiles' },
    { name: 'jobapplications', model: JobApplication, description: 'Career application submissions' },
    { name: 'contactmessages', model: ContactMessage, description: 'Contact form messages' },
    { name: 'communityposts', model: CommunityPost, description: 'Community forum posts' },
    { name: 'communitycomments', model: CommunityComment, description: 'Community post comments' },
    { name: 'communitylikes', model: CommunityLike, description: 'Community post likes' },
    { name: 'subscriptions', model: Subscription, description: 'Stripe payment subscriptions' },
    { name: 'presences', model: Presence, description: 'User online/offline status' },
    { name: 'notifications', model: Notification, description: 'User notification system' },
    { name: 'emailqueue', model: EmailQueue, description: 'Email delivery tracking' },
    { name: 'agents', model: Agent, description: 'AI agent management system' },
    { name: 'visitors', model: Visitor, description: 'Visitor tracking analytics' },
    { name: 'pageviews', model: PageView, description: 'Page navigation analytics' },
    { name: 'chatinteractions', model: ChatInteraction, description: 'AI chat conversations' },
    { name: 'toolusages', model: ToolUsage, description: 'Developer tool usage' },
    { name: 'labexperiments', model: LabExperiment, description: 'AI lab experiments' },
    { name: 'userevents', model: UserEvent, description: 'Custom user events' },
    { name: 'sessions', model: Session, description: 'User session tracking' },
    { name: 'apiusages', model: ApiUsage, description: 'API endpoint analytics' },
    
    // Pricing and Subscription Models
    { name: 'plans', model: Plan, description: 'Subscription pricing plans' },
    { name: 'payments', model: Payment, description: 'Payment transactions and processing' },
    { name: 'coupons', model: Coupon, description: 'Discount codes and promotions' },
    { name: 'billings', model: Billing, description: 'Billing cycles and usage tracking' },
    { name: 'invoices', model: Invoice, description: 'Invoice generation and management' },
  ]

  for (const collection of collections) {
    try {
      // Ensure collection exists by creating an index
      await collection.model.init()
      
      const count = await collection.model.countDocuments()
      console.log(`✅ ${collection.name.padEnd(20)} - ${collection.description} (${count} documents)`)
      
    } catch (error) {
      console.log(`❌ ${collection.name.padEnd(20)} - Failed to initialize: ${error.message}`)
    }
  }
}

async function createSampleData() {
  console.log('\n🔧 Creating Sample Data...\n')

  try {
    // Check if sample data already exists
    const existingUser = await User.findOne({ email: 'admin@onelastai.com' })
    if (existingUser) {
      console.log('ℹ️  Sample data already exists, skipping creation')
      return
    }

    // Create sample user
    const sampleUser = new User({
      email: 'admin@onelastai.com',
      name: 'Admin User',
      authMethod: 'password',
      role: 'admin',
      isActive: true
    })
    await sampleUser.save()
    console.log('✅ Created sample admin user')

    // Create sample community post
    const samplePost = new CommunityPost({
      authorId: sampleUser._id,
      authorName: 'Admin User',
      content: 'Welcome to the One Last AI community! This is a sample post to test the community features.',
      category: 'general',
      isPinned: true
    })
    await samplePost.save()
    console.log('✅ Created sample community post')

    // Create sample contact message
    const sampleContact = new ContactMessage({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Contact Message',
      message: 'This is a test contact message to verify the system is working.',
      category: 'general',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser'
    })
    await sampleContact.save()
    console.log('✅ Created sample contact message')

    // Create sample visitor
    const sampleVisitor = new Visitor({
      visitorId: 'test-visitor-' + Date.now(),
      sessionId: 'test-session-' + Date.now(),
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser',
      device: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
      landingPage: '/',
      visitCount: 1
    })
    await sampleVisitor.save()
    console.log('✅ Created sample visitor')

    // Create sample notification
    const sampleNotification = new Notification({
      userId: sampleUser._id.toString(),
      type: 'in-app',
      category: 'system',
      title: 'Welcome to One Last AI!',
      message: 'Your account has been successfully created. Explore our AI agents and tools.',
      priority: 'medium',
      channels: ['in-app', 'email']
    })
    await sampleNotification.save()
    console.log('✅ Created sample notification')

    // Create sample agent
    const sampleAgent = new Agent({
      agentId: 'general-assistant',
      name: 'General AI Assistant',
      description: 'A versatile AI assistant that can help with various tasks including answering questions, writing, and analysis.',
      category: 'assistant',
      avatar: '🤖',
      prompt: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user queries.',
      aiModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      isActive: true,
      isPublic: true,
      isPremium: false,
      features: ['Text Generation', 'Question Answering', 'Analysis', 'Writing'],
      tags: ['general', 'assistant', 'helpful'],
      capabilities: ['Natural Language Understanding', 'Text Generation', 'Analysis'],
      creator: 'system'
    })
    await sampleAgent.save()
    console.log('✅ Created sample agent')

    // Create sample pricing plans
    const freePlan = new Plan({
      name: 'Free',
      displayName: 'Free Plan',
      description: 'Basic AI access with limited usage',
      type: 'free',
      billingPeriod: 'monthly',
      price: {
        amount: 0,
        currency: 'USD'
      },
      features: {
        limits: {
          apiCallsPerMonth: 100,
          storageGB: 1,
          maxAgents: 1
        }
      },
      isActive: true,
      isPublic: true
    })
    await freePlan.save()
    
    const proPlan = new Plan({
      name: 'Pro',
      displayName: 'Pro Plan', 
      description: 'Advanced AI features for power users',
      type: 'paid',
      billingPeriod: 'monthly',
      price: {
        amount: 2900, // $29.00
        currency: 'USD'
      },
      features: {
        limits: {
          apiCallsPerMonth: 10000,
          storageGB: 50,
          maxAgents: 10
        }
      },
      isActive: true,
      isPublic: true
    })
    await proPlan.save()
    console.log('✅ Created sample pricing plans')

    // Create sample subscription for user
    const sampleSubscription = new Subscription({
      userId: sampleUser._id,
      planId: freePlan._id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      billingCycle: 'monthly'
    })
    await sampleSubscription.save()
    console.log('✅ Created sample subscription')

    // Create sample coupon
    const sampleCoupon = new Coupon({
      code: 'WELCOME25',
      name: 'Welcome Discount',
      description: '25% off first month for new users',
      type: 'percentage',
      discount: {
        percentage: 25
      },
      status: 'active',
      validity: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      },
      usage: {
        maxUses: 1000,
        maxUsesPerCustomer: 1
      },
      management: {
        createdBy: sampleUser._id
      }
    })
    await sampleCoupon.save()
    console.log('✅ Created sample coupon')

    // Create sample billing record
    const sampleBilling = new Billing({
      user: sampleUser._id,
      subscription: sampleSubscription._id,
      plan: freePlan._id,
      billingPeriod: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 'monthly',
        periodNumber: 1
      },
      financial: {
        baseAmount: 0,
        subtotal: 0,
        totalAmount: 0,
        amountDue: 0,
        currency: 'USD'
      },
      payment: {
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })
    await sampleBilling.save()
    console.log('✅ Created sample billing record')

    // Create sample invoice
    const sampleInvoice = new Invoice({
      user: sampleUser._id,
      subscription: sampleSubscription._id,
      billing: sampleBilling._id,
      status: 'paid',
      financial: {
        lineItems: [{
          description: 'Free Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          type: 'subscription',
          planId: freePlan._id
        }],
        subtotal: 0,
        total: 0,
        amountDue: 0,
        amountPaid: 0,
        currency: 'USD'
      },
      dates: {
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidDate: new Date()
      },
      customer: {
        name: sampleUser.name,
        email: sampleUser.email
      }
    })
    await sampleInvoice.save()
    console.log('✅ Created sample invoice')

    console.log('\n🎉 Sample data created successfully!')

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
  }
}

async function checkCollectionHealth() {
  console.log('\n📊 Collection Health Check...\n')

  const collections = await mongoose.connection.db.listCollections().toArray()
  
  console.log('Database Collections:')
  collections.forEach(col => {
    console.log(`  📁 ${col.name}`)
  })

  console.log(`\n✅ Total collections: ${collections.length}`)
  
  // Check indexes
  console.log('\n🔍 Index Information:')
  for (const col of collections) {
    try {
      const indexes = await mongoose.connection.db.collection(col.name).listIndexes().toArray()
      console.log(`  ${col.name}: ${indexes.length} indexes`)
    } catch (error) {
      console.log(`  ${col.name}: Error checking indexes`)
    }
  }
}

async function main() {
  console.log('🚀 One Last AI - Database Initializer\n')
  
  await connectToDatabase()
  await initializeCollections()
  await createSampleData()
  await checkCollectionHealth()
  
  console.log('\n✨ Database initialization complete!')
  console.log('\n📊 View your collections at: MongoDB Compass')
  console.log('🔗 Admin Dashboard: /api/admin/dashboard?type=overview')
  
  await mongoose.disconnect()
  console.log('\n👋 Disconnected from MongoDB')
}

// Run the script
main().catch(error => {
  console.error('💥 Script failed:', error)
  process.exit(1)
})