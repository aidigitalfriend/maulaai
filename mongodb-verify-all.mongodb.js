/*
 * =========================================
 * OneLastAI - Database Verification Playground
 * =========================================
 *
 * Use this to verify all collections have data
 * and check what's actually stored in MongoDB
 *
 * Make sure you're connected to your MongoDB cluster!
 */

// ============================================
// SELECT YOUR DATABASE
// ============================================
use('onelastai');

// ============================================
// 1. COLLECTION OVERVIEW - What exists?
// ============================================
console.log('📊 === COLLECTION OVERVIEW ===');

const collections = db.getCollectionNames();
console.log(`Total Collections: ${collections.length}`);
collections.forEach((c) => console.log(`  - ${c}`));

// ============================================
// 2. DOCUMENT COUNTS - How much data?
// ============================================
console.log('\n📈 === DOCUMENT COUNTS ===');

const expectedCollections = [
  'users',
  'userprofiles',
  'userpreferences',
  'usersecurities',
  'sessions',
  'subscriptions',
  'visitors',
  'pageviews',
  'agents',
  'apiusages',
  'notifications',
  'rewardscenters',
  'securityLogs',
  'plans',
  'coupons',
  'communityposts',
  'communitycomments',
  'communitylikes',
  'contactmessages',
  'chatinteractions',
  'toolusages',
  'userevents',
  'transactions',
];

expectedCollections.forEach((collName) => {
  try {
    const count = db.getCollection(collName).countDocuments();
    const status = count > 0 ? '✅' : '❌';
    console.log(`${status} ${collName}: ${count} documents`);
  } catch (e) {
    console.log(`⚠️ ${collName}: Collection doesn't exist`);
  }
});

// ============================================
// 3. USERS - Check user data structure
// ============================================
console.log('\n👤 === RECENT USERS ===');

const recentUsers = db.users
  .find(
    {},
    {
      email: 1,
      name: 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
      lastLoginAt: 1,
      twoFactorEnabled: 1,
      'preferences.theme': 1,
    }
  )
  .sort({ createdAt: -1 })
  .limit(5)
  .toArray();

recentUsers.forEach((u) => {
  console.log(
    `- ${u.email} | ${u.name || 'No name'} | Role: ${u.role || 'user'} | 2FA: ${
      u.twoFactorEnabled ? 'Yes' : 'No'
    }`
  );
});

// ============================================
// 4. AGENTS - Check agent catalog
// ============================================
console.log('\n🤖 === AGENTS ===');

const agents = db.agents
  .find(
    {},
    {
      id: 1,
      name: 1,
      slug: 1,
      category: 1,
      isActive: 1,
      'pricing.daily': 1,
      'pricing.weekly': 1,
      'pricing.monthly': 1,
    }
  )
  .toArray();

console.log(`Total Agents: ${agents.length}`);
agents.forEach((a) => {
  console.log(
    `- ${a.name} (${a.slug}) | Category: ${a.category} | Active: ${a.isActive}`
  );
  if (a.pricing) {
    console.log(
      `  Pricing: $${a.pricing.daily}/day, $${a.pricing.weekly}/week, $${a.pricing.monthly}/month`
    );
  }
});

// ============================================
// 5. SUBSCRIPTIONS - Active subscriptions
// ============================================
console.log('\n💳 === ACTIVE SUBSCRIPTIONS ===');

const activeSubscriptions = db.subscriptions
  .find({
    status: 'active',
    expiryDate: { $gt: new Date() },
  })
  .toArray();

console.log(`Active Subscriptions: ${activeSubscriptions.length}`);
activeSubscriptions.forEach((s) => {
  console.log(
    `- User: ${s.userId} | Agent: ${s.agentId} | Plan: ${s.plan} | Expires: ${s.expiryDate}`
  );
});

// All subscriptions
const allSubs = db.subscriptions.find({}).toArray();
console.log(`\nTotal Subscriptions (all status): ${allSubs.length}`);

// ============================================
// 6. CHAT INTERACTIONS - Conversation history
// ============================================
console.log('\n💬 === RECENT CHAT INTERACTIONS ===');

const recentChats = db.chatinteractions
  .find({})
  .sort({ startTime: -1 })
  .limit(5)
  .toArray();

console.log(`Total Conversations: ${db.chatinteractions.countDocuments()}`);
recentChats.forEach((c) => {
  console.log(
    `- Conv: ${c.conversationId} | Agent: ${c.agentId} | Messages: ${
      c.totalMessages || c.messages?.length || 0
    }`
  );
});

// ============================================
// 7. ANALYTICS - Visitor & Session data
// ============================================
console.log('\n📊 === ANALYTICS ===');

const visitorCount = db.visitors.countDocuments();
const sessionCount = db.sessions.countDocuments();
const pageviewCount = db.pageviews.countDocuments();
const eventCount = db.userevents.countDocuments();

console.log(`Visitors: ${visitorCount}`);
console.log(`Sessions: ${sessionCount}`);
console.log(`Page Views: ${pageviewCount}`);
console.log(`User Events: ${eventCount}`);

// ============================================
// 8. COMMUNITY - Posts & engagement
// ============================================
console.log('\n👥 === COMMUNITY ===');

const postCount = db.communityposts.countDocuments();
const commentCount = db.communitycomments?.countDocuments() || 0;
const likeCount = db.communitylikes?.countDocuments() || 0;

console.log(`Posts: ${postCount}`);
console.log(`Comments: ${commentCount}`);
console.log(`Likes: ${likeCount}`);

// ============================================
// 9. INDEX CHECK - Are indexes created?
// ============================================
console.log('\n🔍 === INDEX CHECK ===');

const checkIndexes = ['users', 'subscriptions', 'agents', 'chatinteractions'];
checkIndexes.forEach((collName) => {
  try {
    const indexes = db.getCollection(collName).getIndexes();
    console.log(`${collName}: ${indexes.length} indexes`);
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
  } catch (e) {
    console.log(`${collName}: No indexes or collection missing`);
  }
});

// ============================================
// 10. DATA QUALITY CHECK
// ============================================
console.log('\n🔍 === DATA QUALITY CHECK ===');

// Users without email
const usersNoEmail = db.users.countDocuments({ email: { $exists: false } });
console.log(
  `Users without email: ${usersNoEmail} ${usersNoEmail > 0 ? '⚠️' : '✅'}`
);

// Users without password (should have passwordless auth)
const usersNoPassword = db.users.countDocuments({
  password: { $exists: false },
  authMethod: { $ne: 'passwordless' },
});
console.log(
  `Users without password (not passwordless): ${usersNoPassword} ${
    usersNoPassword > 0 ? '⚠️' : '✅'
  }`
);

// Subscriptions with past expiry still marked active
const expiredButActive = db.subscriptions.countDocuments({
  status: 'active',
  expiryDate: { $lt: new Date() },
});
console.log(
  `Expired but still 'active' subscriptions: ${expiredButActive} ${
    expiredButActive > 0 ? '⚠️' : '✅'
  }`
);

// ============================================
// 11. SAMPLE DATA STRUCTURES
// ============================================
console.log('\n📋 === SAMPLE DATA STRUCTURES ===');

// Sample user structure
const sampleUser = db.users.findOne();
if (sampleUser) {
  console.log('\nSample User Fields:');
  Object.keys(sampleUser).forEach((key) => {
    const value = sampleUser[key];
    const type = Array.isArray(value) ? 'Array' : typeof value;
    console.log(`  ${key}: ${type}`);
  });
}

// Sample subscription structure
const sampleSub = db.subscriptions.findOne();
if (sampleSub) {
  console.log('\nSample Subscription Fields:');
  Object.keys(sampleSub).forEach((key) => {
    console.log(`  ${key}: ${typeof sampleSub[key]}`);
  });
}

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

const summary = {
  users: db.users.countDocuments(),
  agents: db.agents.countDocuments(),
  subscriptions: db.subscriptions.countDocuments(),
  chats: db.chatinteractions.countDocuments(),
  posts: db.communityposts.countDocuments(),
};

Object.entries(summary).forEach(([key, count]) => {
  const status = count > 0 ? '✅' : '❌ NEEDS DATA';
  console.log(`${key}: ${count} ${status}`);
});

// Final output
console.log(
  '\n🎯 Run this playground after each feature to verify data is saving!'
);
