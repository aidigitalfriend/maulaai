/**
 * AGENT SUBSCRIPTIONS ROUTES - PRISMA VERSION
 * PostgreSQL-based subscription management for One Last AI
 */

import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { AgentSubscriptionService } from '../lib/db.js';

const router = express.Router();

// Lazy initialization of Stripe
let stripe = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }
  return stripe;
};

// Helper function to calculate expiry date
const calculateExpiryDate = (plan, startDate) => {
  const date = new Date(startDate);
  switch (plan) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      throw new Error(`Invalid plan: ${plan}`);
  }
  return date;
};

// Helper function to check if subscription is valid
const isSubscriptionValid = (subscription) => {
  return subscription.status === 'active' && new Date(subscription.expiryDate) > new Date();
};

// ============================================
// 1. Create/Subscribe to Agent
// ============================================
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, agentId, plan } = req.body;

    if (!userId || !agentId || !plan) {
      return res.status(400).json({
        error: 'Missing required fields: userId, agentId, plan',
      });
    }

    // Validate plan and set price
    const prices = { daily: 1, weekly: 5, monthly: 15 };
    if (!prices[plan]) {
      return res.status(400).json({
        error: 'Invalid plan. Choose: daily, weekly, or monthly',
      });
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.agentSubscription.findFirst({
      where: {
        userId,
        agentId,
        status: 'active',
        expiryDate: { gt: new Date() }
      }
    });

    if (existingSubscription) {
      return res.status(409).json({
        error: 'Active subscription already exists for this agent',
        subscription: existingSubscription,
      });
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = calculateExpiryDate(plan, startDate);

    // Create new subscription
    const subscription = await prisma.agentSubscription.create({
      data: {
        userId,
        agentId,
        plan,
        price: prices[plan],
        startDate,
        expiryDate,
        status: 'active',
      }
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// ============================================
// 2. Get User's Subscriptions
// ============================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, agentId } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;

    const subscriptions = await prisma.agentSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: {
            name: true,
            avatarUrl: true,
            specialty: true
          }
        }
      }
    });

    res.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch subscriptions',
      subscriptions: []
    });
  }
});

// ============================================
// 3. Check if User Has Active Subscription for Agent
// ============================================
router.get('/check/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    const subscription = await prisma.agentSubscription.findFirst({
      where: {
        userId,
        agentId,
        status: 'active',
        expiryDate: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate days remaining if subscription exists
    let daysRemaining = 0;
    if (subscription && subscription.expiryDate) {
      daysRemaining = Math.ceil(
        (new Date(subscription.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
    }

    res.json({
      hasActiveSubscription: !!subscription,
      hasAccess: !!subscription,
      subscription: subscription
        ? {
            ...subscription,
            daysRemaining,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ 
      error: 'Failed to check subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// 4. Get All Active Subscriptions
// ============================================
router.get('/active', async (req, res) => {
  try {
    const subscriptions = await prisma.agentSubscription.findMany({
      where: {
        status: 'active',
        expiryDate: { gt: new Date() },
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch active subscriptions' });
  }
});

// ============================================
// 5. Update Subscription (Cancel/Renew)
// ============================================
router.put('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status, autoRenew, plan } = req.body;

    const subscription = await prisma.agentSubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updateData = {};

    // Update status if provided
    if (status) {
      updateData.status = status;
    }

    // Update auto-renew if provided
    if (typeof autoRenew === 'boolean') {
      updateData.autoRenew = autoRenew;
    }

    // Change plan if provided
    if (plan && plan !== subscription.plan) {
      const prices = { daily: 1, weekly: 5, monthly: 15 };
      updateData.plan = plan;
      updateData.price = prices[plan];
      updateData.expiryDate = calculateExpiryDate(plan, subscription.startDate);
    }

    const updated = await prisma.agentSubscription.update({
      where: { id: subscriptionId },
      data: updateData
    });

    res.json({
      message: 'Subscription updated successfully',
      subscription: updated,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// ============================================
// 6. Renew Subscription
// ============================================
router.post('/:subscriptionId/renew', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await prisma.agentSubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Calculate new expiry date from current expiry
    const newExpiryDate = calculateExpiryDate(subscription.plan, subscription.expiryDate);

    const updated = await prisma.agentSubscription.update({
      where: { id: subscriptionId },
      data: {
        expiryDate: newExpiryDate,
        status: 'active',
      }
    });

    res.json({
      message: 'Subscription renewed successfully',
      subscription: updated,
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({ error: 'Failed to renew subscription' });
  }
});

// ============================================
// 7. Cancel Subscription
// ============================================
router.delete('/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await prisma.agentSubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updated = await prisma.agentSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        autoRenew: false,
      }
    });

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: updated,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================
// 8. Get Expiring Subscriptions (for auto-renewal job)
// ============================================
router.get('/expiring/soon', async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + parseInt(days));

    const subscriptions = await prisma.agentSubscription.findMany({
      where: {
        status: 'active',
        autoRenew: true,
        expiryDate: {
          gte: new Date(),
          lte: expiryThreshold,
        },
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching expiring subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch expiring subscriptions' });
  }
});

// ============================================
// 9. Get Subscription Stats (Admin)
// ============================================
router.get('/stats/overview', async (req, res) => {
  try {
    // Status breakdown
    const statusBreakdown = await prisma.agentSubscription.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { price: true }
    });

    // Plan breakdown for active subscriptions
    const planBreakdown = await prisma.agentSubscription.groupBy({
      by: ['plan'],
      where: { status: 'active' },
      _count: { plan: true }
    });

    // Agent popularity
    const agentPopularity = await prisma.agentSubscription.groupBy({
      by: ['agentId'],
      where: { status: 'active' },
      _count: { agentId: true },
      orderBy: {
        _count: { agentId: 'desc' }
      }
    });

    res.json({
      statusBreakdown: statusBreakdown.map(s => ({
        _id: s.status,
        count: s._count.status,
        totalRevenue: s._sum.price || 0
      })),
      planBreakdown: planBreakdown.map(p => ({
        _id: p.plan,
        count: p._count.plan
      })),
      agentPopularity: agentPopularity.map(a => ({
        _id: a.agentId,
        subscribers: a._count.agentId
      })),
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscription stats' });
  }
});

// ============================================
// 10. Cancel Subscription by userId/agentId
// ============================================
router.post('/cancel', async (req, res) => {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, agentId',
      });
    }

    // Find active subscription
    const subscription = await prisma.agentSubscription.findFirst({
      where: {
        userId,
        agentId,
        status: 'active',
      }
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'No active subscription found for this agent',
      });
    }

    // Mark as cancelled
    const updated = await prisma.agentSubscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' }
    });

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: {
        id: updated.id,
        agentId: updated.agentId,
        plan: updated.plan,
        status: 'cancelled',
        wasExpiringOn: updated.expiryDate,
        cancelledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================
// 11. Verify Stripe Session (ONE-TIME PAYMENT)
// ============================================
router.post('/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    console.log('🔍 Verifying Stripe session:', sessionId);

    // Retrieve the session from Stripe
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });

    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not completed:', session.payment_status);
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
      });
    }

    // Get customer email
    const customer = session.customer;
    const customerEmail = customer?.email || session.customer_email;

    if (!customerEmail) {
      console.error('❌ No customer email found');
      return res.status(400).json({
        success: false,
        error: 'Customer information missing',
      });
    }

    // Extract metadata from session (for one-time payments, metadata is on session)
    const agentId = session.metadata?.agentId;
    const agentName = session.metadata?.agentName;
    const plan = session.metadata?.plan;
    const userId = session.metadata?.userId;

    if (!agentId || !agentName || !plan) {
      console.error('❌ Missing metadata:', { agentId, agentName, plan });
      return res.status(400).json({
        success: false,
        error: 'Payment information missing',
      });
    }

    if (!userId) {
      console.error('❌ Missing userId in session metadata');
      return res.status(400).json({
        success: false,
        error: 'User information missing',
      });
    }

    // Calculate expiry date based on plan (one-time payment)
    const startDate = new Date();
    const expiryDate = new Date();
    
    switch (plan) {
      case 'daily':
        expiryDate.setDate(expiryDate.getDate() + 1);
        break;
      case 'weekly':
        expiryDate.setDate(expiryDate.getDate() + 7);
        break;
      case 'monthly':
        expiryDate.setDate(expiryDate.getDate() + 30);
        break;
      default:
        expiryDate.setDate(expiryDate.getDate() + 30); // Default to 30 days
    }

    const price = session.amount_total ? session.amount_total / 100 : 0;
    const paymentIntentId = session.payment_intent?.id || session.payment_intent;

    console.log('✅ Payment verified successfully:', {
      sessionId,
      customerEmail,
      agentId,
      agentName,
      plan,
      amount: session.amount_total,
      paymentIntentId,
    });

    // Check if subscription already exists by Stripe session ID (to prevent duplicates)
    const existingByStripeId = await prisma.agentSubscription.findFirst({
      where: { stripeSubscriptionId: sessionId }
    });

    if (existingByStripeId) {
      // Already processed this session
      const daysRemaining = Math.ceil(
        (existingByStripeId.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return res.json({
        success: true,
        hasAccess: true,
        subscription: {
          id: existingByStripeId.id,
          agentId: existingByStripeId.agentId,
          plan: existingByStripeId.plan,
          status: 'active',
          expiryDate: existingByStripeId.expiryDate,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          price: existingByStripeId.price,
        },
      });
    }

    // Check if user already has active subscription for this agent
    const existingSubscription = await prisma.agentSubscription.findFirst({
      where: { userId, agentId, status: 'active' }
    });

    let subscriptionRecord;
    if (existingSubscription) {
      // Extend existing subscription
      const newExpiry = new Date(Math.max(existingSubscription.expiryDate.getTime(), Date.now()));
      switch (plan) {
        case 'daily':
          newExpiry.setDate(newExpiry.getDate() + 1);
          break;
        case 'weekly':
          newExpiry.setDate(newExpiry.getDate() + 7);
          break;
        case 'monthly':
          newExpiry.setDate(newExpiry.getDate() + 30);
          break;
      }
      
      subscriptionRecord = await prisma.agentSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'active',
          plan,
          price,
          expiryDate: newExpiry,
          stripeSubscriptionId: sessionId, // Store session ID to prevent reuse
        }
      });
    } else {
      // Create new subscription record
      subscriptionRecord = await prisma.agentSubscription.create({
        data: {
          userId,
          agentId,
          plan,
          price,
          status: 'active',
          startDate,
          expiryDate,
          stripeSubscriptionId: sessionId, // Store session ID to prevent reuse
        }
      });
    }

    res.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: subscriptionRecord.id,
        agentId: subscriptionRecord.agentId,
        plan: subscriptionRecord.plan,
        status: subscriptionRecord.status,
        expiryDate: subscriptionRecord.expiryDate,
        daysRemaining: Math.ceil(
          (subscriptionRecord.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        price: subscriptionRecord.price,
      },
      session: {
        id: session.id,
        customerEmail,
        paymentStatus: session.payment_status,
      },
    });
  } catch (error) {
    console.error('❌ Session verification error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    });
  }
});

export default router;
