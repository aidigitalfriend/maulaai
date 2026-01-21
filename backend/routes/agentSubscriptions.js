import express from 'express';
import AgentSubscription from '../models/AgentSubscription.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';

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
    const existingSubscription = await AgentSubscription.findOne({
      userId,
      agentId,
    });

    if (existingSubscription && existingSubscription.isValid()) {
      return res.status(409).json({
        error: 'Active subscription already exists for this agent',
        subscription: existingSubscription,
      });
    }

    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = AgentSubscription.calculateExpiryDate(plan, startDate);

    // Create new subscription
    const subscription = new AgentSubscription({
      userId,
      agentId,
      plan,
      price: prices[plan],
      startDate,
      expiryDate,
      status: 'active',
    });

    await subscription.save();

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

    const query = { userId };
    if (status) query.status = status;
    if (agentId) query.agentId = agentId;

    const subscriptions = await AgentSubscription.find(query).sort({
      createdAt: -1,
    });

    res.json({
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// ============================================
// 3. Check if User Has Active Subscription for Agent
// ============================================
router.get('/check/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    const subscription = await AgentSubscription.findOne({
      userId,
      agentId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    });

    res.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// ============================================
// 4. Get All Active Subscriptions
// ============================================
router.get('/active', async (req, res) => {
  try {
    const subscriptions = await AgentSubscription.find({
      status: 'active',
      expiryDate: { $gt: new Date() },
    }).sort({ expiryDate: 1 });

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

    const subscription = await AgentSubscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Update status if provided
    if (status) {
      subscription.status = status;
    }

    // Update auto-renew if provided
    if (typeof autoRenew === 'boolean') {
      subscription.autoRenew = autoRenew;
    }

    // Change plan if provided
    if (plan && plan !== subscription.plan) {
      const prices = { daily: 1, weekly: 5, monthly: 15 };
      subscription.plan = plan;
      subscription.price = prices[plan];
      subscription.expiryDate = AgentSubscription.calculateExpiryDate(
        plan,
        subscription.startDate
      );
    }

    await subscription.save();

    res.json({
      message: 'Subscription updated successfully',
      subscription,
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

    const subscription = await AgentSubscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Calculate new expiry date
    const newExpiryDate = AgentSubscription.calculateExpiryDate(
      subscription.plan,
      subscription.expiryDate
    );

    subscription.expiryDate = newExpiryDate;
    subscription.status = 'active';
    subscription.lastRenewal = new Date();

    await subscription.save();

    res.json({
      message: 'Subscription renewed successfully',
      subscription,
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

    const subscription = await AgentSubscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;

    await subscription.save();

    res.json({
      message: 'Subscription cancelled successfully',
      subscription,
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

    const subscriptions = await AgentSubscription.find({
      status: 'active',
      autoRenew: true,
      expiryDate: {
        $gte: new Date(),
        $lte: expiryThreshold,
      },
    }).sort({ expiryDate: 1 });

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
    const stats = await AgentSubscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
    ]);

    const planStats = await AgentSubscription.aggregate([
      {
        $match: { status: 'active' },
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
        },
      },
    ]);

    const agentStats = await AgentSubscription.aggregate([
      {
        $match: { status: 'active' },
      },
      {
        $group: {
          _id: '$agentId',
          subscribers: { $sum: 1 },
        },
      },
      {
        $sort: { subscribers: -1 },
      },
    ]);

    res.json({
      statusBreakdown: stats,
      planBreakdown: planStats,
      agentPopularity: agentStats,
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscription stats' });
  }
});

// ============================================
// 10. Cancel Subscription
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
    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'No active subscription found for this agent',
      });
    }

    // Mark as cancelled (keep in database for history)
    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
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
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================
// 7. Get User Subscriptions
// ============================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    // Find all subscriptions for this user
    const subscriptions = await AgentSubscription.find({
      userId: userId,
    }).sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      subscriptions: subscriptions,
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch subscriptions',
      subscriptions: [],
    });
  }
});

// ============================================
// 8. Check User Agent Access
// ============================================
router.get('/check/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    if (!userId || !agentId) {
      return res.status(400).json({
        error: 'User ID and Agent ID are required',
      });
    }

    // Find active subscription for this user and agent
    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
      expiryDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });

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
      hasAccess: !!subscription, // For frontend compatibility
      subscription: subscription
        ? {
            ...subscription.toObject(),
            daysRemaining,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({
      error: 'Failed to check subscription',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// 9. Verify Stripe Session
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
      expand: ['subscription', 'customer'],
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

    // Get payment period object (we use Stripe subscription mode with cancel_at_period_end)
    const subscriptionData = session.subscription;

    if (!subscriptionData) {
      console.error('❌ No subscription found in session');
      return res.status(400).json({
        success: false,
        error: 'Subscription not found',
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

    // Extract metadata (from subscription_data metadata)
    const agentId =
      subscriptionData.metadata?.agentId || session.metadata?.agentId;
    const agentName =
      subscriptionData.metadata?.agentName || session.metadata?.agentName;
    const plan = subscriptionData.metadata?.plan || session.metadata?.plan;

    if (!agentId || !agentName || !plan) {
      console.error('❌ Missing metadata:', { agentId, agentName, plan });
      return res.status(400).json({
        success: false,
        error: 'Payment information missing',
      });
    }

    console.log('✅ Payment verified successfully:', {
      sessionId,
      customerEmail,
      agentId,
      agentName,
      plan,
      amount: session.amount_total,
      subscriptionId: subscriptionData.id,
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
    });

    // Use subscription period dates (cancel_at_period_end is true, so it won't auto-renew)
    const startDate = new Date(subscriptionData.current_period_start * 1000);
    const expiryDate = new Date(subscriptionData.current_period_end * 1000);

    // Get price from session
    const price = session.amount_total ? session.amount_total / 100 : 0;

    // Convert userId to ObjectId for proper backend filtering
    const userId = session.metadata?.userId
      ? new mongoose.Types.ObjectId(session.metadata.userId)
      : null;

    if (!userId) {
      console.error('❌ Missing userId in session metadata');
      return res.status(400).json({
        success: false,
        error: 'User information missing',
      });
    }

    // Check if subscription already exists (avoid duplicates)
    const existingByStripeId = await AgentSubscription.findOne({
      stripeSubscriptionId: subscriptionData.id,
    });

    if (existingByStripeId) {
      // Update user field if missing AND ensure status is active
      // Since payment is successful, this subscription should be active
      existingByStripeId.status = 'active';
      existingByStripeId.startDate = startDate;
      existingByStripeId.expiryDate = expiryDate;
      if (!existingByStripeId.userId) {
        existingByStripeId.userId = userId;
      }
      existingByStripeId.updatedAt = new Date();
      await existingByStripeId.save();
      console.log(
        '✅ Updated existing subscription to active:',
        subscriptionData.id
      );

      const daysRemaining = Math.ceil(
        (existingByStripeId.expiryDate.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      return res.json({
        success: true,
        hasAccess: true,
        subscription: {
          id: existingByStripeId._id,
          agentId: existingByStripeId.agentId,
          plan: existingByStripeId.plan,
          status: 'active', // Always return active for successful payment
          expiryDate: existingByStripeId.expiryDate,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          price: existingByStripeId.price,
        },
      });
    }

    // Check if user already has subscription for this agent
    const existingSubscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
    });

    let subscriptionRecord;
    if (existingSubscription) {
      // Update existing record - extend access
      existingSubscription.status = 'active';
      existingSubscription.plan = plan;
      existingSubscription.price = price;
      existingSubscription.startDate = startDate;
      existingSubscription.expiryDate = expiryDate;
      existingSubscription.stripeSubscriptionId = subscriptionData.id;
      existingSubscription.updatedAt = new Date();
      await existingSubscription.save();
      subscriptionRecord = existingSubscription;
    } else {
      // Create new subscription record
      subscriptionRecord = new AgentSubscription({
        userId,
        agentId,
        agentName,
        plan,
        price,
        status: 'active',
        startDate,
        expiryDate,
        stripeSubscriptionId: subscriptionData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await subscriptionRecord.save();
    }

    // Return access details
    res.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: subscriptionRecord._id,
        agentId: subscriptionRecord.agentId,
        agentName: subscriptionRecord.agentName,
        plan: subscriptionRecord.plan,
        status: subscriptionRecord.status,
        expiryDate: subscriptionRecord.expiryDate,
        daysRemaining: Math.ceil(
          (subscriptionRecord.expiryDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
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
