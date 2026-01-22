/**
 * Create Agent Subscriptions for Testing
 * This script creates sample agent subscriptions for a user
 */

const mongoose = require('mongoose');
const AgentSubscription = require('../models/AgentSubscription');
require('dotenv').config();

const AGENT_SLUGS = [
  'einstein-ai',
  'chess-master',
  'comedy-king',
  'fitness-coach',
  'chef-extraordinaire',
  'travel-guide',
  'financial-advisor',
  'language-tutor',
  'meditation-guide',
];

async function createAgentSubscriptions() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Get the first active user with a session
    const user = await users.findOne({
      sessionExpiry: { $gt: new Date() },
    });

    if (!user) {
      console.error('❌ No active user found. Please log in first.');
      process.exit(1);
    }

    console.log(`\n👤 Creating subscriptions for user: ${user.email}`);
    console.log(`   User ID: ${user._id.toString()}`);

    // Delete existing subscriptions for this user
    const deleted = await AgentSubscription.deleteMany({
      userId: user._id.toString(),
    });
    console.log(`\n🗑️  Deleted ${deleted.deletedCount} existing subscriptions`);

    // Create 9 active agent subscriptions
    const now = new Date();
    const subscriptions = [];

    for (let i = 0; i < 9; i++) {
      const agentId = AGENT_SLUGS[i];
      const plan = i < 3 ? 'monthly' : i < 6 ? 'weekly' : 'daily';

      let expiryDate;
      let createdAt = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000); // Stagger creation dates

      switch (plan) {
        case 'monthly':
          expiryDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          expiryDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'daily':
          expiryDate = new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000);
          break;
      }

      subscriptions.push({
        userId: user._id.toString(),
        agentId: agentId,
        plan: plan,
        status: 'active',
        expiryDate: expiryDate,
        createdAt: createdAt,
        updatedAt: createdAt,
      });
    }

    const created = await AgentSubscription.insertMany(subscriptions);
    console.log(`\n✅ Created ${created.length} agent subscriptions:`);

    // Display created subscriptions
    created.forEach((sub, idx) => {
      const daysRemaining = Math.ceil(
        (sub.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(
        `   ${idx + 1}. ${sub.agentId} - ${
          sub.plan
        } (expires in ${daysRemaining} days)`
      );
    });

    // Verify count
    const count = await AgentSubscription.countDocuments({
      userId: user._id.toString(),
      status: 'active',
      expiryDate: { $gt: now },
    });

    console.log(`\n✅ Verification: ${count} active subscriptions in database`);

    console.log('\n✅ Done! You can now refresh the billing page.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createAgentSubscriptions();
}

module.exports = createAgentSubscriptions;
