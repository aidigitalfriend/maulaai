// Debug script for /api/user/analytics logic
// Usage:
//   cd backend
//   node scripts/debug-user-analytics.js 6939d3ed321177ababee615e

import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'onelastai';

if (!uri) {
  console.error('❌ MONGODB_URI is not set');
  process.exit(1);
}

async function main() {
  const userIdArg = process.argv[2];
  if (!userIdArg) {
    console.error('Usage: node scripts/debug-user-analytics.js <userId>');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    console.log('🚀 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(dbName);
    console.log(`📊 Using database: ${db.databaseName}`);

    const users = db.collection('users');
    const performanceMetrics = db.collection('performancemetrics');
    const chatInteractions = db.collection('chat_interactions');

    console.log('➡️  Looking up user by _id...');
    let user;
    try {
      user = await users.findOne({ _id: new ObjectId(userIdArg) });
    } catch (err) {
      console.error('❌ Error converting/looking up user by ObjectId:', err);
      return;
    }

    if (!user) {
      console.error('❌ User not found for _id:', userIdArg);
      return;
    }

    console.log('✅ Found user:', {
      _id: user._id,
      email: user.email,
      subscription: user.subscription,
    });

    let userObjectId;
    try {
      userObjectId =
        user._id instanceof ObjectId ? user._id : new ObjectId(user._id);
    } catch (err) {
      console.error('❌ Invalid user._id format:', err);
      return;
    }

    console.log('🔑 Using userObjectId:', userObjectId.toHexString());

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    console.log('➡️  Counting conversations and messages...');
    const totalConversations = await chatInteractions.countDocuments({
      userId: userObjectId,
    });
    const totalMessages = await chatInteractions.countDocuments({
      userId: userObjectId,
    });

    console.log('   totalConversations =', totalConversations);
    console.log('   totalMessages (raw count) =', totalMessages);

    console.log('➡️  Counting performance metrics (API calls)...');
    const totalApiCalls = await performanceMetrics.countDocuments({
      userId: userObjectId,
    });
    console.log('   totalApiCalls =', totalApiCalls);

    console.log('➡️  Fetching recent interactions...');
    const recentInteractions = await chatInteractions
      .find({ userId: userObjectId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    console.log('   recentInteractions.length =', recentInteractions.length);

    console.log('➡️  Aggregating daily usage for last 7 days...');
    const dailyUsageData = await chatInteractions
      .aggregate([
        {
          $match: {
            userId: userObjectId,
            timestamp: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
            },
            conversations: { $sum: 1 },
            messages: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ])
      .toArray();

    console.log('   dailyUsageData =', dailyUsageData);

    console.log(
      '✅ Debug run complete. If all steps above succeeded, /api/user/analytics should not throw for this user.'
    );
  } catch (err) {
    console.error('❌ Top-level error in debug script:', err);
  } finally {
    await client.close();
  }
}

main();
