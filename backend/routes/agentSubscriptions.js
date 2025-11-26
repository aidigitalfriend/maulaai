import express from 'express';
import AgentSubscription from '../models/AgentSubscription.js';
import mongoose from 'mongoose';

const router = express.Router();

// ============================================
// 1. Create/Subscribe to Agent
// ============================================
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, agentId, plan } = req.body;

    if (!userId || !agentId || !plan) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, agentId, plan' 
      });
    }

    // Validate plan and set price
    const prices = { daily: 1, weekly: 5, monthly: 19 };
    if (!prices[plan]) {
      return res.status(400).json({ 
        error: 'Invalid plan. Choose: daily, weekly, or monthly' 
      });
    }

    // Check if subscription already exists
    const existingSubscription = await AgentSubscription.findOne({ 
      userId, 
      agentId 
    });

    if (existingSubscription && existingSubscription.isValid()) {
      return res.status(409).json({ 
        error: 'Active subscription already exists for this agent',
        subscription: existingSubscription
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
      status: 'active'
    });

    await subscription.save();

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
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

    const subscriptions = await AgentSubscription.find(query)
      .sort({ createdAt: -1 });

    res.json({
      count: subscriptions.length,
      subscriptions
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
      expiryDate: { $gt: new Date() }
    });

    res.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null
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
      expiryDate: { $gt: new Date() }
    }).sort({ expiryDate: 1 });

    res.json({
      count: subscriptions.length,
      subscriptions
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
      const prices = { daily: 1, weekly: 5, monthly: 19 };
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
      subscription
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
      subscription
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
      subscription
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
        $lte: expiryThreshold 
      }
    }).sort({ expiryDate: 1 });

    res.json({
      count: subscriptions.length,
      subscriptions
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
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const planStats = await AgentSubscription.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    const agentStats = await AgentSubscription.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$agentId',
          subscribers: { $sum: 1 }
        }
      },
      {
        $sort: { subscribers: -1 }
      }
    ]);

    res.json({
      statusBreakdown: stats,
      planBreakdown: planStats,
      agentPopularity: agentStats
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscription stats' });
  }
});

export default router;
