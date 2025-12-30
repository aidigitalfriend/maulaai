// MongoDB Index Creation Script
// Run this script to add all missing indexes identified in the database audit
// Database: onelastai
// Date: December 30, 2025

use('onelastai');

console.log('🚀 Starting index creation...\n');

// ============================================
// 1. userpreferences - User UI/notification preferences
// ============================================
console.log('📁 Creating indexes for userpreferences...');
try {
  db.userpreferences.createIndex(
    { userId: 1 },
    { unique: true, name: 'userId_unique' }
  );
  console.log('   ✅ userId_unique created');
} catch (e) {
  console.log('   ⚠️ userId_unique: ' + e.message);
}

// ============================================
// 2. usersecurities - Security data (2FA, sessions)
// ============================================
console.log('📁 Creating indexes for usersecurities...');
try {
  db.usersecurities.createIndex(
    { userId: 1 },
    { unique: true, name: 'userId_unique' }
  );
  console.log('   ✅ userId_unique created');
} catch (e) {
  console.log('   ⚠️ userId_unique: ' + e.message);
}
try {
  db.usersecurities.createIndex({ email: 1 }, { name: 'email_1' });
  console.log('   ✅ email_1 created');
} catch (e) {
  console.log('   ⚠️ email_1: ' + e.message);
}
try {
  db.usersecurities.createIndex(
    { accountLocked: 1 },
    { name: 'accountLocked_1' }
  );
  console.log('   ✅ accountLocked_1 created');
} catch (e) {
  console.log('   ⚠️ accountLocked_1: ' + e.message);
}

// ============================================
// 3. notifications - User notifications
// ============================================
console.log('📁 Creating indexes for notifications...');
try {
  db.notifications.createIndex(
    { userId: 1, read: 1, createdAt: -1 },
    { name: 'userId_read_createdAt' }
  );
  console.log('   ✅ userId_read_createdAt created');
} catch (e) {
  console.log('   ⚠️ userId_read_createdAt: ' + e.message);
}
try {
  db.notifications.createIndex({ userId: 1, type: 1 }, { name: 'userId_type' });
  console.log('   ✅ userId_type created');
} catch (e) {
  console.log('   ⚠️ userId_type: ' + e.message);
}
try {
  db.notifications.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 7776000, name: 'createdAt_ttl_90days' }
  ); // 90 days TTL
  console.log('   ✅ createdAt_ttl_90days created (auto-expire after 90 days)');
} catch (e) {
  console.log('   ⚠️ createdAt_ttl_90days: ' + e.message);
}

// ============================================
// 4. rewardscenters - Gamification/rewards
// ============================================
console.log('📁 Creating indexes for rewardscenters...');
try {
  db.rewardscenters.createIndex(
    { userId: 1 },
    { unique: true, name: 'userId_unique' }
  );
  console.log('   ✅ userId_unique created');
} catch (e) {
  console.log('   ⚠️ userId_unique: ' + e.message);
}
try {
  db.rewardscenters.createIndex(
    { totalPoints: -1 },
    { name: 'totalPoints_desc' }
  );
  console.log('   ✅ totalPoints_desc created (for leaderboard)');
} catch (e) {
  console.log('   ⚠️ totalPoints_desc: ' + e.message);
}
try {
  db.rewardscenters.createIndex(
    { currentLevel: -1 },
    { name: 'currentLevel_desc' }
  );
  console.log('   ✅ currentLevel_desc created');
} catch (e) {
  console.log('   ⚠️ currentLevel_desc: ' + e.message);
}

// ============================================
// 5. toolusages - AI tool usage tracking
// ============================================
console.log('📁 Creating indexes for toolusages...');
try {
  db.toolusages.createIndex(
    { userId: 1, occurredAt: -1 },
    { name: 'userId_occurredAt' }
  );
  console.log('   ✅ userId_occurredAt created');
} catch (e) {
  console.log('   ⚠️ userId_occurredAt: ' + e.message);
}
try {
  db.toolusages.createIndex(
    { toolName: 1, occurredAt: -1 },
    { name: 'toolName_occurredAt' }
  );
  console.log('   ✅ toolName_occurredAt created');
} catch (e) {
  console.log('   ⚠️ toolName_occurredAt: ' + e.message);
}
try {
  db.toolusages.createIndex({ agentId: 1 }, { name: 'agentId_1' });
  console.log('   ✅ agentId_1 created');
} catch (e) {
  console.log('   ⚠️ agentId_1: ' + e.message);
}
try {
  db.toolusages.createIndex({ sessionId: 1 }, { name: 'sessionId_1' });
  console.log('   ✅ sessionId_1 created');
} catch (e) {
  console.log('   ⚠️ sessionId_1: ' + e.message);
}

// ============================================
// 6. userevents - User action tracking
// ============================================
console.log('📁 Creating indexes for userevents...');
try {
  db.userevents.createIndex(
    { userId: 1, occurredAt: -1 },
    { name: 'userId_occurredAt' }
  );
  console.log('   ✅ userId_occurredAt created');
} catch (e) {
  console.log('   ⚠️ userId_occurredAt: ' + e.message);
}
try {
  db.userevents.createIndex(
    { eventType: 1, occurredAt: -1 },
    { name: 'eventType_occurredAt' }
  );
  console.log('   ✅ eventType_occurredAt created');
} catch (e) {
  console.log('   ⚠️ eventType_occurredAt: ' + e.message);
}
try {
  db.userevents.createIndex(
    { category: 1, action: 1 },
    { name: 'category_action' }
  );
  console.log('   ✅ category_action created');
} catch (e) {
  console.log('   ⚠️ category_action: ' + e.message);
}
try {
  db.userevents.createIndex({ sessionId: 1 }, { name: 'sessionId_1' });
  console.log('   ✅ sessionId_1 created');
} catch (e) {
  console.log('   ⚠️ sessionId_1: ' + e.message);
}

// ============================================
// 7. contactmessages - Contact form submissions
// ============================================
console.log('📁 Creating indexes for contactmessages...');
try {
  db.contactmessages.createIndex(
    { status: 1, createdAt: -1 },
    { name: 'status_createdAt' }
  );
  console.log('   ✅ status_createdAt created');
} catch (e) {
  console.log('   ⚠️ status_createdAt: ' + e.message);
}
try {
  db.contactmessages.createIndex({ email: 1 }, { name: 'email_1' });
  console.log('   ✅ email_1 created');
} catch (e) {
  console.log('   ⚠️ email_1: ' + e.message);
}
try {
  db.contactmessages.createIndex({ category: 1 }, { name: 'category_1' });
  console.log('   ✅ category_1 created');
} catch (e) {
  console.log('   ⚠️ category_1: ' + e.message);
}

// ============================================
// 8. securityLogs - Security audit logs
// ============================================
console.log('📁 Creating indexes for securityLogs...');
try {
  db.securityLogs.createIndex(
    { userId: 1, timestamp: -1 },
    { name: 'userId_timestamp' }
  );
  console.log('   ✅ userId_timestamp created');
} catch (e) {
  console.log('   ⚠️ userId_timestamp: ' + e.message);
}
try {
  db.securityLogs.createIndex(
    { action: 1, timestamp: -1 },
    { name: 'action_timestamp' }
  );
  console.log('   ✅ action_timestamp created');
} catch (e) {
  console.log('   ⚠️ action_timestamp: ' + e.message);
}
try {
  db.securityLogs.createIndex({ ip: 1 }, { name: 'ip_1' });
  console.log('   ✅ ip_1 created');
} catch (e) {
  console.log('   ⚠️ ip_1: ' + e.message);
}
try {
  db.securityLogs.createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 15552000, name: 'timestamp_ttl_180days' }
  ); // 180 days TTL
  console.log(
    '   ✅ timestamp_ttl_180days created (auto-expire after 180 days)'
  );
} catch (e) {
  console.log('   ⚠️ timestamp_ttl_180days: ' + e.message);
}

// ============================================
// 9. communityposts - Community posts
// ============================================
console.log('📁 Creating indexes for communityposts...');
try {
  db.communityposts.createIndex({ authorId: 1 }, { name: 'authorId_1' });
  console.log('   ✅ authorId_1 created');
} catch (e) {
  console.log('   ⚠️ authorId_1: ' + e.message);
}
try {
  db.communityposts.createIndex(
    { category: 1, createdAt: -1 },
    { name: 'category_createdAt' }
  );
  console.log('   ✅ category_createdAt created');
} catch (e) {
  console.log('   ⚠️ category_createdAt: ' + e.message);
}
try {
  db.communityposts.createIndex(
    { isPinned: -1, createdAt: -1 },
    { name: 'isPinned_createdAt' }
  );
  console.log('   ✅ isPinned_createdAt created');
} catch (e) {
  console.log('   ⚠️ isPinned_createdAt: ' + e.message);
}
try {
  db.communityposts.createIndex(
    { likesCount: -1 },
    { name: 'likesCount_desc' }
  );
  console.log('   ✅ likesCount_desc created (for trending)');
} catch (e) {
  console.log('   ⚠️ likesCount_desc: ' + e.message);
}

// ============================================
// 10. plans - Subscription plans
// ============================================
console.log('📁 Creating indexes for plans...');
try {
  db.plans.createIndex({ slug: 1 }, { unique: true, name: 'slug_unique' });
  console.log('   ✅ slug_unique created');
} catch (e) {
  console.log('   ⚠️ slug_unique: ' + e.message);
}
try {
  db.plans.createIndex(
    { status: 1, 'visibility.public': 1 },
    { name: 'status_visibility' }
  );
  console.log('   ✅ status_visibility created');
} catch (e) {
  console.log('   ⚠️ status_visibility: ' + e.message);
}
try {
  db.plans.createIndex({ type: 1, category: 1 }, { name: 'type_category' });
  console.log('   ✅ type_category created');
} catch (e) {
  console.log('   ⚠️ type_category: ' + e.message);
}

// ============================================
// 11. coupons - Discount codes
// ============================================
console.log('📁 Creating indexes for coupons...');
try {
  db.coupons.createIndex({ code: 1 }, { unique: true, name: 'code_unique' });
  console.log('   ✅ code_unique created');
} catch (e) {
  console.log('   ⚠️ code_unique: ' + e.message);
}
try {
  db.coupons.createIndex(
    { status: 1, 'validity.endDate': 1 },
    { name: 'status_validity' }
  );
  console.log('   ✅ status_validity created');
} catch (e) {
  console.log('   ⚠️ status_validity: ' + e.message);
}
try {
  db.coupons.createIndex({ type: 1, status: 1 }, { name: 'type_status' });
  console.log('   ✅ type_status created');
} catch (e) {
  console.log('   ⚠️ type_status: ' + e.message);
}

// ============================================
// 12. users - Add missing indexes
// ============================================
console.log('📁 Creating additional indexes for users...');
try {
  db.users.createIndex(
    { passwordChangedAt: -1 },
    { name: 'passwordChangedAt_desc' }
  );
  console.log('   ✅ passwordChangedAt_desc created');
} catch (e) {
  console.log('   ⚠️ passwordChangedAt_desc: ' + e.message);
}
try {
  db.users.createIndex({ twoFactorEnabled: 1 }, { name: 'twoFactorEnabled_1' });
  console.log('   ✅ twoFactorEnabled_1 created');
} catch (e) {
  console.log('   ⚠️ twoFactorEnabled_1: ' + e.message);
}

// ============================================
// 13. sessions - Add TTL index for auto-cleanup
// ============================================
console.log('📁 Creating TTL index for sessions...');
try {
  db.sessions.createIndex(
    { lastActivity: 1 },
    { expireAfterSeconds: 604800, name: 'lastActivity_ttl_7days' }
  ); // 7 days
  console.log(
    '   ✅ lastActivity_ttl_7days created (auto-expire inactive sessions after 7 days)'
  );
} catch (e) {
  console.log('   ⚠️ lastActivity_ttl_7days: ' + e.message);
}

// ============================================
// SUMMARY
// ============================================
console.log('\n========================================');
console.log('📊 INDEX CREATION COMPLETE');
console.log('========================================\n');

// List all indexes for verification
const collections = [
  'userpreferences',
  'usersecurities',
  'notifications',
  'rewardscenters',
  'toolusages',
  'userevents',
  'contactmessages',
  'securityLogs',
  'communityposts',
  'plans',
  'coupons',
  'users',
  'sessions',
];

console.log('📋 Current Index Counts:\n');
collections.forEach((coll) => {
  try {
    const indexes = db.getCollection(coll).getIndexes();
    console.log(`   ${coll}: ${indexes.length} indexes`);
  } catch (e) {
    console.log(`   ${coll}: Error - ${e.message}`);
  }
});

console.log('\n✅ Script completed successfully!');
console.log('💡 Run db.<collection>.getIndexes() to verify specific indexes');
