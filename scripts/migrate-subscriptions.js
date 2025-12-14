/**
 * Migration script to copy existing Stripe subscriptions to agent subscriptions
 * Run this once to migrate existing data
 */

import mongoose from 'mongoose';
import { getSubscriptionModel } from '../frontend/models/Subscription.js';
import { getAgentSubscriptionModel } from '../frontend/models/AgentSubscription.js';

async function migrateSubscriptions() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const SubscriptionModel = await getSubscriptionModel();
    const AgentSubscriptionModel = await getAgentSubscriptionModel();

    // Find all active subscriptions
    const subscriptions = await SubscriptionModel.find({
      status: 'active',
    });

    console.log(
      `Found ${subscriptions.length} active subscriptions to migrate`
    );

    for (const sub of subscriptions) {
      // Check if agent subscription already exists
      const existingAgentSub = await AgentSubscriptionModel.findOne({
        userId: sub.userId,
        agentId: sub.agentId,
      });

      if (!existingAgentSub) {
        // Calculate expiry date from currentPeriodEnd
        const expiryDate = new Date(sub.currentPeriodEnd);

        // Create agent subscription
        const agentSub = new AgentSubscriptionModel({
          userId: sub.userId,
          agentId: sub.agentId,
          plan: sub.plan,
          price: sub.price / 100, // Convert from cents
          status: 'active',
          startDate: sub.startDate,
          expiryDate: expiryDate,
          autoRenew: !sub.cancelAtPeriodEnd,
        });

        await agentSub.save();
        console.log(
          `Migrated subscription for user ${sub.userId}, agent ${sub.agentId}`
        );
      } else {
        console.log(
          `Agent subscription already exists for user ${sub.userId}, agent ${sub.agentId}`
        );
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateSubscriptions();
}

export { migrateSubscriptions };
