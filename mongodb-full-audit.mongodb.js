/*
 * =====================================================
 * 🔥 OneLastAI - COMPLETE DATABASE VERIFICATION
 * =====================================================
 *
 * 169 Pages | 32 Collections | PROFESSIONAL AUDIT
 *
 * Connect to your MongoDB cluster and run this!
 */

use('onelastai');

console.log('🔥 OneLastAI Database Audit Starting...\n');
console.log('='.repeat(60));

// =====================================================
// COLLECTION EXISTENCE CHECK
// =====================================================

console.log('\n📋 COLLECTION CHECK (32 Required):\n');

const requiredCollections = {
  // EXISTING (Should have data)
  existing: [
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
  ],
  // NEED TO CREATE
  new: [
    'toolusages',
    'userevents',
    'transactions',
    'labexperiments',
    'agentpersonalizations',
    'userfavorites',
    'supporttickets',
    'supportchats',
    'consultations',
    'communitysuggestions',
    'webinarregistrations',
    'jobapplications',
  ],
};

let existingOk = 0;
let existingMissing = 0;
let newCreated = 0;
let newMissing = 0;

console.log('--- EXISTING COLLECTIONS ---');
requiredCollections.existing.forEach((coll) => {
  try {
    const count = db.getCollection(coll).countDocuments();
    const status = count > 0 ? '✅' : '⚠️ EMPTY';
    console.log(`${status} ${coll}: ${count} documents`);
    if (count > 0) existingOk++;
    else existingMissing++;
  } catch (e) {
    console.log(`❌ ${coll}: MISSING`);
    existingMissing++;
  }
});

console.log('\n--- NEW COLLECTIONS NEEDED ---');
requiredCollections.new.forEach((coll) => {
  try {
    const count = db.getCollection(coll).countDocuments();
    console.log(`✅ ${coll}: ${count} documents (created)`);
    newCreated++;
  } catch (e) {
    console.log(`❌ ${coll}: NOT CREATED YET`);
    newMissing++;
  }
});

// =====================================================
// USER DATA CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('👤 USER DATA CHECK:\n');

const userCount = db.users.countDocuments();
console.log(`Total Users: ${userCount}`);

if (userCount > 0) {
  // Check user schema completeness
  const sampleUser = db.users.findOne();
  const userFields = [
    'email',
    'name',
    'password',
    'avatar',
    'bio',
    'phoneNumber',
    'location',
    'timezone',
    'profession',
    'company',
    'socialLinks',
    'preferences',
    'twoFactorEnabled',
    'role',
    'createdAt',
    'lastLoginAt',
    'isActive',
  ];

  console.log('\nUser Schema Check:');
  userFields.forEach((field) => {
    const hasField = sampleUser[field] !== undefined;
    console.log(`  ${hasField ? '✅' : '❌'} ${field}`);
  });

  // Recent users
  console.log('\nRecent Users (last 5):');
  db.users
    .find({}, { email: 1, name: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(5)
    .forEach((u) => {
      console.log(`  - ${u.email} | ${u.name || 'No name'} | ${u.createdAt}`);
    });
}

// =====================================================
// AGENT DATA CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('🤖 AGENT DATA CHECK:\n');

const agentCount = db.agents.countDocuments();
console.log(`Total Agents: ${agentCount}`);

if (agentCount > 0) {
  console.log('\nAgent List:');
  db.agents
    .find(
      {},
      { id: 1, name: 1, slug: 1, category: 1, isActive: 1, 'pricing.daily': 1 }
    )
    .forEach((a) => {
      console.log(
        `  ${a.isActive ? '✅' : '❌'} ${a.name} (${a.slug}) - $${
          a.pricing?.daily || 'N/A'
        }/day`
      );
    });
} else {
  console.log('⚠️ NO AGENTS IN DATABASE - Need to seed agents!');
}

// =====================================================
// SUBSCRIPTION DATA CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('💳 SUBSCRIPTION DATA CHECK:\n');

const subCount = db.subscriptions.countDocuments();
const activeSubCount = db.subscriptions.countDocuments({
  status: 'active',
  expiryDate: { $gt: new Date() },
});
const expiredSubCount = db.subscriptions.countDocuments({
  status: 'active',
  expiryDate: { $lt: new Date() },
});

console.log(`Total Subscriptions: ${subCount}`);
console.log(`Active (not expired): ${activeSubCount}`);
console.log(
  `Expired but status='active': ${expiredSubCount} ${
    expiredSubCount > 0 ? '⚠️ NEEDS FIX' : '✅'
  }`
);

if (subCount > 0) {
  console.log('\nRecent Subscriptions:');
  db.subscriptions
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .forEach((s) => {
      console.log(
        `  - User: ${s.userId} | Agent: ${s.agentId} | ${s.plan} | ${s.status} | Expires: ${s.expiryDate}`
      );
    });
}

// =====================================================
// CHAT INTERACTIONS CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('💬 CHAT INTERACTIONS CHECK:\n');

const chatCount = db.chatinteractions.countDocuments();
console.log(`Total Conversations: ${chatCount}`);

if (chatCount > 0) {
  const totalMessages = db.chatinteractions
    .aggregate([{ $group: { _id: null, total: { $sum: '$totalMessages' } } }])
    .toArray();
  console.log(`Total Messages: ${totalMessages[0]?.total || 'N/A'}`);

  console.log('\nRecent Conversations:');
  db.chatinteractions
    .find({})
    .sort({ startTime: -1 })
    .limit(5)
    .forEach((c) => {
      console.log(
        `  - ${c.conversationId} | Agent: ${c.agentId} | Messages: ${
          c.totalMessages || c.messages?.length || 0
        }`
      );
    });
}

// =====================================================
// ANALYTICS CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('📊 ANALYTICS CHECK:\n');

const analyticsData = {
  visitors: db.visitors?.countDocuments() || 0,
  sessions: db.sessions?.countDocuments() || 0,
  pageviews: db.pageviews?.countDocuments() || 0,
  userevents: db.userevents?.countDocuments() || 0,
  toolusages: db.toolusages?.countDocuments() || 0,
  apiusages: db.apiusages?.countDocuments() || 0,
};

Object.entries(analyticsData).forEach(([key, count]) => {
  const status = count > 0 ? '✅' : '❌ NO DATA';
  console.log(`${key}: ${count} ${status}`);
});

// =====================================================
// COMMUNITY CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('👥 COMMUNITY CHECK:\n');

const communityData = {
  posts: db.communityposts?.countDocuments() || 0,
  comments: db.communitycomments?.countDocuments() || 0,
  likes: db.communitylikes?.countDocuments() || 0,
};

Object.entries(communityData).forEach(([key, count]) => {
  console.log(`${key}: ${count}`);
});

// =====================================================
// INDEX CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('🔍 INDEX CHECK:\n');

const collectionsToCheckIndexes = [
  'users',
  'subscriptions',
  'agents',
  'chatinteractions',
  'visitors',
];

collectionsToCheckIndexes.forEach((coll) => {
  try {
    const indexes = db.getCollection(coll).getIndexes();
    console.log(`${coll}: ${indexes.length} indexes`);
  } catch (e) {
    console.log(`${coll}: ⚠️ Cannot check indexes`);
  }
});

// =====================================================
// DATA INTEGRITY CHECK
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('🔒 DATA INTEGRITY CHECK:\n');

// Users without email
const usersNoEmail = db.users.countDocuments({ email: { $exists: false } });
console.log(
  `Users without email: ${usersNoEmail} ${usersNoEmail > 0 ? '❌ BAD' : '✅'}`
);

// Subscriptions with invalid userId
const orphanedSubs = db.subscriptions.countDocuments({ userId: null });
console.log(
  `Subscriptions without userId: ${orphanedSubs} ${
    orphanedSubs > 0 ? '❌ BAD' : '✅'
  }`
);

// Chat without userId
const orphanedChats = db.chatinteractions.countDocuments({ userId: null });
console.log(
  `Chats without userId: ${orphanedChats} ${orphanedChats > 0 ? '⚠️' : '✅'}`
);

// =====================================================
// SUMMARY
// =====================================================

console.log('\n' + '='.repeat(60));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(60));

console.log(
  `\nExisting Collections OK: ${existingOk}/${requiredCollections.existing.length}`
);
console.log(`Existing Collections Missing/Empty: ${existingMissing}`);
console.log(
  `New Collections Created: ${newCreated}/${requiredCollections.new.length}`
);
console.log(`New Collections Needed: ${newMissing}`);

const totalScore = (((existingOk + newCreated) / 32) * 100).toFixed(1);
console.log(`\n🎯 Database Readiness: ${totalScore}%`);

if (totalScore < 50) {
  console.log('\n❌ CRITICAL: Database needs significant setup!');
} else if (totalScore < 80) {
  console.log('\n⚠️ WARNING: Some collections need attention');
} else {
  console.log('\n✅ GOOD: Database is mostly ready');
}

console.log('\n' + '='.repeat(60));
console.log(
  '🔥 Audit Complete! Check COMPLETE_DATABASE_MAPPING.md for full plan'
);
console.log('='.repeat(60));
