// MongoDB Index Creation Script for OneLastAI Database
// Run this script to add all missing indexes for optimal performance

print('🚀 Starting index creation for OneLastAI database...');

// userpreferences
print('📝 Creating indexes for userpreferences collection...');
db.userpreferences.createIndex({ userId: 1 }, { unique: true });

// usersecurities
print('🔒 Creating indexes for usersecurities collection...');
db.usersecurities.createIndex({ userId: 1 }, { unique: true });
db.usersecurities.createIndex({ email: 1 });

// notifications
print('🔔 Creating indexes for notifications collection...');
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });

// rewardscenters
print('🎁 Creating indexes for rewardscenters collection...');
db.rewardscenters.createIndex({ userId: 1 }, { unique: true });
db.rewardscenters.createIndex({ totalPoints: -1 });

// toolusages
print('🔧 Creating indexes for toolusages collection...');
db.toolusages.createIndex({ userId: 1, occurredAt: -1 });
db.toolusages.createIndex({ toolName: 1 });

// userevents
print('📊 Creating indexes for userevents collection...');
db.userevents.createIndex({ userId: 1, occurredAt: -1 });
db.userevents.createIndex({ eventType: 1, category: 1 });

// contactmessages
print('💬 Creating indexes for contactmessages collection...');
db.contactmessages.createIndex({ status: 1, createdAt: -1 });
db.contactmessages.createIndex({ email: 1 });

// securityLogs
print('🛡️ Creating indexes for securityLogs collection...');
db.securityLogs.createIndex({ userId: 1, timestamp: -1 });
db.securityLogs.createIndex({ action: 1 });

// communityposts
print('🌐 Creating indexes for communityposts collection...');
db.communityposts.createIndex({ authorId: 1 });
db.communityposts.createIndex({ category: 1, createdAt: -1 });
db.communityposts.createIndex({ isPinned: -1, createdAt: -1 });

// plans
print('📋 Creating indexes for plans collection...');
db.plans.createIndex({ slug: 1 }, { unique: true });
db.plans.createIndex({ status: 1, 'visibility.public': 1 });

// coupons
print('🎫 Creating indexes for coupons collection...');
db.coupons.createIndex({ code: 1 }, { unique: true });
db.coupons.createIndex({ status: 1, 'validity.endDate': 1 });

print('✅ All missing indexes created successfully!');
print('🎉 Database performance optimization complete!');
