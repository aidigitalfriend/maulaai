/**
 * Per-Agent Subscription API Routes
 * Simple pricing: $1 daily, $5 weekly, $19 monthly per agent
 */

import express from 'express';
import mongoose from 'mongoose';
import AgentSubscription from '../models/AgentSubscription.js';
import User from '../models/User.js';
import Agent from '../models/Agent.ts';

const router = express.Router();

// Get available pricing plans
router.get('/pricing', async (req, res) => {
  try {
    // Hardcoded pricing plans for now
    const plans = [
      {
        id: 'daily',
        name: 'daily',
        displayName: 'Daily Access',
        description: 'Pay per day access to any agent',
        billingPeriod: 'daily',
        price: { amount: 100 }, // $1.00 in cents
        priceFormatted: '$1.00',
        period: 'daily',
        features: ['Full agent access', '24-hour validity', 'Cancel anytime'],
        savings: null,
        recommended: false,
      },
      {
        id: 'weekly',
        name: 'weekly',
        displayName: 'Weekly Access',
        description: 'Weekly subscription to any agent',
        billingPeriod: 'weekly',
        price: { amount: 500 }, // $5.00 in cents
        priceFormatted: '$5.00',
        period: 'weekly',
        features: ['Full agent access', '7-day validity', 'Save 30% vs daily'],
        savings: 'Save 30%',
        recommended: true,
      },
      {
        id: 'monthly',
        name: 'monthly',
        displayName: 'Monthly Access',
        description: 'Monthly subscription to any agent',
        billingPeriod: 'monthly',
        price: { amount: 1900 }, // $19.00 in cents
        priceFormatted: '$19.00',
        period: 'monthly',
        features: ['Full agent access', '30-day validity', 'Save 68% vs daily'],
        savings: 'Save 68%',
        recommended: false,
      },
    ];

    const pricingResponse = {
      perAgentPricing: true,
      plans: plans,
    };

    res.json({
      success: true,
      data: pricingResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing plans',
      message: error.message,
    });
  }
});

// Get available agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true, isPublic: true })
      .select(
        'agentId name description category avatar features tags capabilities isPremium'
      )
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        agents,
        totalAgents: agents.length,
        pricing: {
          perAgent: true,
          daily: '$1.00',
          weekly: '$5.00',
          monthly: '$19.00',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      message: error.message,
    });
  }
});

// Get user's active agent subscriptions
router.get('/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await AgentSubscription.find({
      userId: userId,
      status: 'active',
    }).sort({ createdAt: -1 });

    // Group by agent
    const agentSubscriptions = subscriptions.map((sub) => ({
      subscriptionId: sub._id,
      agentId: sub.agentId,
      agentName: sub.agentName || `Agent ${sub.agentId}`,
      status: sub.status,
      plan: sub.plan,
      price: sub.price,
      startDate: sub.startDate,
      expiryDate: sub.expiryDate,
      subscribedAt: sub.createdAt,
    }));

    res.json({
      success: true,
      data: {
        userId,
        activeSubscriptions: agentSubscriptions,
        totalSubscriptions: agentSubscriptions.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user subscriptions',
      message: error.message,
    });
  }
});

// ✅ Check if user has active subscription for specific agent
router.post('/check-active', async (req, res) => {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'userId and agentId are required',
      });
    }

    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
      expiryDate: { $gt: new Date() }, // Not expired
    });

    if (subscription) {
      const daysRemaining = Math.ceil(
        (subscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      return res.json({
        success: true,
        hasActive: true,
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          price: subscription.price,
          status: subscription.status,
          startDate: subscription.startDate,
          expiryDate: subscription.expiryDate,
          daysRemaining: daysRemaining,
          autoRenew: subscription.autoRenew,
        },
      });
    }

    return res.json({
      success: true,
      hasActive: false,
      subscription: null,
    });
  } catch (error) {
    console.error('Check active subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check subscription',
      message: error.message,
    });
  }
});

// ✅ Cancel user's active subscription
router.post('/cancel', async (req, res) => {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'userId and agentId are required',
      });
    }

    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found for this agent',
      });
    }

    // Update status to cancelled (keep record for history)
    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: subscription._id,
        agentId: subscription.agentId,
        plan: subscription.plan,
        status: 'cancelled',
        wasExpiringOn: subscription.expiryDate,
        cancelledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});

// Subscribe to an agent
// Subscribe to an agent
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, agentId, planId, couponCode } = req.body;

    // Validate required fields
    if (!userId || !agentId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, agentId, planId',
      });
    }

    // Validate planId (should be daily, weekly, or monthly)
    const validPlans = ['daily', 'weekly', 'monthly'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Must be: daily, weekly, or monthly',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if agent exists (try both _id and agentId)
    const agent = await Agent.findOne({
      $or: [{ _id: agentId }, { agentId: agentId }],
      isActive: true,
    });
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found or inactive',
      });
    }

    // Check if user already has active subscription for this agent
    const existingSubscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agent.agentId || agent._id.toString(),
      status: 'active',
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        error: 'User already has an active subscription for this agent',
      });
    }

    // Calculate price and expiry date
    let price = 0;
    switch (planId) {
      case 'daily':
        price = 1.0;
        break;
      case 'weekly':
        price = 5.0;
        break;
      case 'monthly':
        price = 19.0;
        break;
    }

    const startDate = new Date();
    const expiryDate = AgentSubscription.calculateExpiryDate(planId, startDate);

    // Create subscription
    const subscription = new AgentSubscription({
      userId: userId,
      agentId: agent.agentId || agent._id.toString(),
      plan: planId,
      price: price,
      status: 'active',
      startDate: startDate,
      expiryDate: expiryDate,
    });

    await subscription.save();

    res.json({
      success: true,
      data: {
        subscriptionId: subscription._id,
        userId: userId,
        agentId: agent.agentId || agent._id.toString(),
        agentName: agent.name || `Agent ${agent.agentId}`,
        plan: planId,
        price: price,
        status: 'active',
        startDate: startDate,
        expiryDate: expiryDate,
        message: 'Subscription created successfully',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.message,
    });
  }
});

// Unsubscribe from an agent
router.delete('/unsubscribe/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { userId } = req.body;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: userId,
      status: { $in: ['active', 'trial'] },
    })
      .populate('plan', 'name')
      .populate('user', 'email name');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found or already inactive',
      });
    }

    // Cancel subscription
    subscription.status = 'canceled';
    subscription.billing.canceledAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: `Successfully unsubscribed from ${subscription.agentName}`,
      data: {
        subscriptionId: subscription._id,
        agentName: subscription.agentName,
        canceledAt: subscription.billing.canceledAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});

// Check if user has access to specific agent
router.get('/access/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    const subscription = await Subscription.findOne({
      user: userId,
      agentId: agentId,
      status: 'active',
      'billing.currentPeriodEnd': { $gt: new Date() },
    }).populate('plan', 'name displayName billingPeriod');

    const hasAccess = !!subscription;

    res.json({
      success: true,
      data: {
        hasAccess,
        agentId,
        userId,
        subscription: hasAccess
          ? {
              id: subscription._id,
              plan: subscription.plan,
              expiresAt: subscription.billing.currentPeriodEnd,
              usage: subscription.usage,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check agent access',
      message: error.message,
    });
  }
});

// Validate coupon code
router.post('/validate-coupon', async (req, res) => {
  try {
    const { couponCode, userId, planId } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required',
      });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      status: 'active',
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired coupon code',
      });
    }

    const user = await User.findById(userId);
    const plan = await Plan.findById(planId);

    if (!user || !plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user or plan',
      });
    }

    const validation = coupon.canBeUsedBy(user, {
      planId,
      amount: plan.price.amount,
    });

    if (!validation.canUse) {
      return res.status(400).json({
        success: false,
        error: 'Coupon cannot be used',
        issues: validation.issues,
      });
    }

    const discountResult = coupon.calculateDiscount(plan.price.amount);

    res.json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
        },
        discount: discountResult,
        originalAmount: plan.price.amount,
        finalAmount: plan.price.amount - discountResult.amount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate coupon',
      message: error.message,
    });
  }
});

export default router;
