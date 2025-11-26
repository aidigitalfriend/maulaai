/**
 * Per-Agent Subscription API Routes
 * Simple pricing: $1 daily, $5 weekly, $19 monthly per agent
 */

import express from 'express'
import mongoose from 'mongoose'
import Plan from '../models/Plan.ts'
import Subscription from '../models/Subscription.ts'
import Agent from '../models/Agent.ts'
import User from '../models/User.ts'
import Coupon from '../models/Coupon.ts'

const router = express.Router()

// Get available pricing plans
router.get('/pricing', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true, isPublic: true })
      .sort({ 'pricing.amount': 1 })
      .select('name displayName description billingPeriod price pricing features metadata')
    
    const pricingResponse = {
      perAgentPricing: true,
      plans: plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        billingPeriod: plan.billingPeriod,
        price: plan.price,
        priceFormatted: `$${(plan.price.amount / 100).toFixed(2)}`,
        period: plan.billingPeriod,
        features: plan.features,
        savings: plan.metadata?.savings || null,
        recommended: plan.metadata?.recommended || false
      }))
    }
    
    res.json({
      success: true,
      data: pricingResponse
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing plans',
      message: error.message
    })
  }
})

// Get available agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true, isPublic: true })
      .select('agentId name description category avatar features tags capabilities isPremium')
      .sort({ name: 1 })
    
    res.json({
      success: true,
      data: {
        agents,
        totalAgents: agents.length,
        pricing: {
          perAgent: true,
          daily: '$1.00',
          weekly: '$5.00', 
          monthly: '$19.00'
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      message: error.message
    })
  }
})

// Get user's active agent subscriptions
router.get('/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const subscriptions = await Subscription.find({ 
      user: userId,
      status: { $in: ['active', 'trial'] }
    })
    .populate('plan', 'name displayName billingPeriod price')
    .populate('user', 'email name')
    .select('agentId agentName status billing usage metadata createdAt')
    
    // Group by agent
    const agentSubscriptions = subscriptions.map(sub => ({
      subscriptionId: sub._id,
      agentId: sub.agentId,
      agentName: sub.agentName,
      status: sub.status,
      plan: sub.plan,
      billing: {
        currentPeriodStart: sub.billing?.currentPeriodStart,
        currentPeriodEnd: sub.billing?.currentPeriodEnd,
        amount: sub.billing?.amount,
        currency: sub.billing?.currency
      },
      usage: sub.usage,
      subscribedAt: sub.createdAt
    }))
    
    res.json({
      success: true,
      data: {
        userId,
        activeSubscriptions: agentSubscriptions,
        totalSubscriptions: agentSubscriptions.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user subscriptions',
      message: error.message
    })
  }
})

// Subscribe to an agent
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, agentId, planId, couponCode } = req.body
    
    // Validate required fields
    if (!userId || !agentId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, agentId, planId'
      })
    }
    
    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    // Check if agent exists
    const agent = await Agent.findOne({ 
      $or: [{ _id: agentId }, { agentId: agentId }],
      isActive: true 
    })
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found or inactive'
      })
    }
    
    // Check if plan exists
    const plan = await Plan.findById(planId)
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found or inactive'
      })
    }
    
    // Check if user already has active subscription for this agent
    const existingSubscription = await Subscription.findOne({
      user: userId,
      agentId: agent.agentId || agent._id,
      status: { $in: ['active', 'trial'] }
    })
    
    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        error: 'User already has an active subscription for this agent',
        data: {
          existingSubscription: existingSubscription._id,
          agentName: existingSubscription.agentName
        }
      })
    }
    
    // Apply coupon if provided
    let discount = 0
    let couponDetails = null
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        status: 'active'
      })
      
      if (coupon && coupon.canBeUsedBy(user, { planId, amount: plan.price.amount })) {
        const discountResult = coupon.calculateDiscount(plan.price.amount)
        discount = discountResult.amount
        couponDetails = {
          code: coupon.code,
          name: coupon.name,
          discount: discountResult
        }
      }
    }
    
    // Calculate billing period dates
    const now = new Date()
    let periodEnd = new Date(now)
    
    switch (plan.billingPeriod) {
      case 'daily':
        periodEnd.setDate(periodEnd.getDate() + 1)
        break
      case 'weekly':
        periodEnd.setDate(periodEnd.getDate() + 7)
        break
      case 'monthly':
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        break
      default:
        periodEnd.setMonth(periodEnd.getMonth() + 1)
    }
    
    // Create subscription
    const subscription = new Subscription({
      user: userId,
      plan: planId,
      status: 'active', // In production, this would be 'pending' until payment
      agentId: agent.agentId || agent._id,
      agentName: agent.name,
      billing: {
        interval: plan.billingPeriod === 'daily' ? 'day' : 
                 plan.billingPeriod === 'weekly' ? 'week' : 'month',
        intervalCount: 1,
        amount: plan.price.amount - discount,
        currency: plan.price.currency,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd
      },
      usage: {
        current: {
          apiCalls: 0,
          totalSessions: 0
        }
      },
      metadata: {
        agentSubscription: true,
        agentDetails: {
          id: agent.agentId || agent._id,
          name: agent.name,
          category: agent.category,
          avatar: agent.avatar
        },
        originalAmount: plan.price.amount,
        discountApplied: discount,
        coupon: couponDetails
      }
    })
    
    await subscription.save()
    
    // Record coupon usage if applied
    if (couponCode && couponDetails) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
      if (coupon) {
        await coupon.recordUsage({
          userId,
          subscriptionId: subscription._id,
          discountAmount: discount,
          originalAmount: plan.price.amount
        })
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${agent.name}`,
      data: {
        subscriptionId: subscription._id,
        agent: {
          id: agent.agentId || agent._id,
          name: agent.name,
          category: agent.category
        },
        plan: {
          name: plan.name,
          period: plan.billingPeriod,
          amount: plan.price.amount - discount,
          originalAmount: plan.price.amount,
          discount: discount
        },
        billing: {
          startDate: now,
          endDate: periodEnd,
          nextBilling: periodEnd
        },
        coupon: couponDetails
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.message
    })
  }
})

// Unsubscribe from an agent
router.delete('/unsubscribe/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params
    const { userId } = req.body
    
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: userId,
      status: { $in: ['active', 'trial'] }
    }).populate('plan', 'name').populate('user', 'email name')
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found or already inactive'
      })
    }
    
    // Cancel subscription
    subscription.status = 'canceled'
    subscription.billing.canceledAt = new Date()
    await subscription.save()
    
    res.json({
      success: true,
      message: `Successfully unsubscribed from ${subscription.agentName}`,
      data: {
        subscriptionId: subscription._id,
        agentName: subscription.agentName,
        canceledAt: subscription.billing.canceledAt
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message
    })
  }
})

// Check if user has access to specific agent
router.get('/access/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params
    
    const subscription = await Subscription.findOne({
      user: userId,
      agentId: agentId,
      status: 'active',
      'billing.currentPeriodEnd': { $gt: new Date() }
    }).populate('plan', 'name displayName billingPeriod')
    
    const hasAccess = !!subscription
    
    res.json({
      success: true,
      data: {
        hasAccess,
        agentId,
        userId,
        subscription: hasAccess ? {
          id: subscription._id,
          plan: subscription.plan,
          expiresAt: subscription.billing.currentPeriodEnd,
          usage: subscription.usage
        } : null
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check agent access',
      message: error.message
    })
  }
})

// Validate coupon code
router.post('/validate-coupon', async (req, res) => {
  try {
    const { couponCode, userId, planId } = req.body
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      })
    }
    
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      status: 'active'
    })
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired coupon code'
      })
    }
    
    const user = await User.findById(userId)
    const plan = await Plan.findById(planId)
    
    if (!user || !plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user or plan'
      })
    }
    
    const validation = coupon.canBeUsedBy(user, { planId, amount: plan.price.amount })
    
    if (!validation.canUse) {
      return res.status(400).json({
        success: false,
        error: 'Coupon cannot be used',
        issues: validation.issues
      })
    }
    
    const discountResult = coupon.calculateDiscount(plan.price.amount)
    
    res.json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type
        },
        discount: discountResult,
        originalAmount: plan.price.amount,
        finalAmount: plan.price.amount - discountResult.amount
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate coupon',
      message: error.message
    })
  }
})

export default router