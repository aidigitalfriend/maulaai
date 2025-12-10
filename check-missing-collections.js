import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkMissingCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('onelastai');

  console.log('=== DASHBOARD PAGES VS DATABASE COLLECTIONS AUDIT ===\n');

  const existingCollections = (await db.listCollections().toArray()).map(
    (c) => c.name
  );
  console.log(
    'EXISTING COLLECTIONS (' + existingCollections.length + '):',
    existingCollections.sort().join(', ')
  );

  console.log('\n=== MISSING COLLECTIONS BY DASHBOARD PAGE ===\n');

  // Security Page Missing Collections (/dashboard/security)
  console.log('🔐 SECURITY PAGE (/dashboard/security) - NEEDS:');
  const securityNeeded = [
    'twofactorauthentication', // 2FA settings, QR codes, backup codes
    'trusteddevices', // Device management and recognition
    'loginhistory', // Login attempts, locations, IPs
    'securitylogs', // Security events and audit trails
    'backupcodes', // 2FA backup codes storage
    'deviceverifications', // Device verification tokens
    'passwordchangelogs', // Password change history
  ];

  const securityMissing = securityNeeded.filter(
    (col) => !existingCollections.includes(col)
  );
  console.log(
    '   MISSING (' + securityMissing.length + '/' + securityNeeded.length + '):'
  );
  securityMissing.forEach((col) => console.log('   ❌', col));

  const securityExists = securityNeeded.filter((col) =>
    existingCollections.includes(col)
  );
  if (securityExists.length > 0) {
    console.log(
      '   EXISTS (' + securityExists.length + '/' + securityNeeded.length + '):'
    );
    securityExists.forEach((col) => console.log('   ✅', col));
  }

  // Rewards Page Missing Collections (/dashboard/rewards)
  console.log('\n🏆 REWARDS PAGE (/dashboard/rewards) - NEEDS:');
  const rewardsNeeded = [
    'achievements', // User achievements/badges
    'rewardpoints', // Points tracking and history
    'leaderboards', // User rankings and scores
    'badges', // Available and earned badges
    'levelsystem', // User levels and XP
    'pointshistory', // Points earned/spent history
    'rewardstore', // Redeemable rewards catalog
    'userlevels', // Current user level tracking
  ];

  const rewardsMissing = rewardsNeeded.filter(
    (col) => !existingCollections.includes(col)
  );
  console.log(
    '   MISSING (' + rewardsMissing.length + '/' + rewardsNeeded.length + '):'
  );
  rewardsMissing.forEach((col) => console.log('   ❌', col));

  const rewardsExists = rewardsNeeded.filter((col) =>
    existingCollections.includes(col)
  );
  if (rewardsExists.length > 0) {
    console.log(
      '   EXISTS (' + rewardsExists.length + '/' + rewardsNeeded.length + '):'
    );
    rewardsExists.forEach((col) => console.log('   ✅', col));
  }

  // Preferences Page Missing Collections (/dashboard/preferences)
  console.log('\n⚙️ PREFERENCES PAGE (/dashboard/preferences) - NEEDS:');
  const preferencesNeeded = [
    'notificationsettings', // Email, push, desktop notifications
    'themesettings', // Theme, colors, font size preferences
    'privacysettings', // Privacy and data sharing settings
    'integrations', // Third-party integrations
    'customizationsettings', // UI customization preferences
  ];

  const preferencesMissing = preferencesNeeded.filter(
    (col) => !existingCollections.includes(col)
  );
  console.log(
    '   MISSING (' +
      preferencesMissing.length +
      '/' +
      preferencesNeeded.length +
      '):'
  );
  preferencesMissing.forEach((col) => console.log('   ❌', col));

  const preferencesExists = preferencesNeeded.filter((col) =>
    existingCollections.includes(col)
  );
  if (preferencesExists.length > 0) {
    console.log(
      '   EXISTS (' +
        preferencesExists.length +
        '/' +
        preferencesNeeded.length +
        '):'
    );
    preferencesExists.forEach((col) => console.log('   ✅', col));
  }

  // Billing Page Missing Collections (/dashboard/billing)
  console.log('\n💳 BILLING PAGE (/dashboard/billing) - NEEDS:');
  const billingNeeded = [
    'invoices', // Detailed invoice records
    'paymentmethods', // Stored payment methods
    'usagemetrics', // Detailed usage tracking
    'billinghistory', // Payment history and transactions
    'costbreakdown', // Cost analysis by feature
    'subscriptionchanges', // Plan change history
  ];

  const billingMissing = billingNeeded.filter(
    (col) => !existingCollections.includes(col)
  );
  console.log(
    '   MISSING (' + billingMissing.length + '/' + billingNeeded.length + '):'
  );
  billingMissing.forEach((col) => console.log('   ❌', col));

  const billingExists = billingNeeded.filter((col) =>
    existingCollections.includes(col)
  );
  if (billingExists.length > 0) {
    console.log(
      '   EXISTS (' + billingExists.length + '/' + billingNeeded.length + '):'
    );
    billingExists.forEach((col) => console.log('   ✅', col));
  }

  // Analytics & Conversation History Missing Collections
  console.log('\n📊 ANALYTICS & CONVERSATION HISTORY - NEEDS:');
  const analyticsNeeded = [
    'conversationanalytics', // Conversation insights
    'performancemetrics', // System performance data
    'usagepatterns', // User behavior patterns
    'searchhistory', // Conversation search history
    'exportlogs', // Data export tracking
    'conversationratings', // Conversation quality ratings
  ];

  const analyticsMissing = analyticsNeeded.filter(
    (col) => !existingCollections.includes(col)
  );
  console.log(
    '   MISSING (' +
      analyticsMissing.length +
      '/' +
      analyticsNeeded.length +
      '):'
  );
  analyticsMissing.forEach((col) => console.log('   ❌', col));

  const analyticsExists = analyticsNeeded.filter((col) =>
    existingCollections.includes(col)
  );
  if (analyticsExists.length > 0) {
    console.log(
      '   EXISTS (' +
        analyticsExists.length +
        '/' +
        analyticsNeeded.length +
        '):'
    );
    analyticsExists.forEach((col) => console.log('   ✅', col));
  }

  // Agent Performance Missing Collections
  console.log('\n🤖 AGENT PERFORMANCE - NEEDS:');
  const agentNeeded = [
    'agentmetrics', // Individual agent performance
    'responseanalytics', // Response time and quality
    'agentoptimization', // Optimization suggestions
    'modelperformance', // Model-specific metrics
    'agentfeedback', // User feedback on agents
    'agenttraining', // Training and improvement data
  ];

  const agentMissing = agentNeeded.filter(
    (col) => !existingCollections.includes(col)
  );
  console.log(
    '   MISSING (' + agentMissing.length + '/' + agentNeeded.length + '):'
  );
  agentMissing.forEach((col) => console.log('   ❌', col));

  const agentExists = agentNeeded.filter((col) =>
    existingCollections.includes(col)
  );
  if (agentExists.length > 0) {
    console.log(
      '   EXISTS (' + agentExists.length + '/' + agentNeeded.length + '):'
    );
    agentExists.forEach((col) => console.log('   ✅', col));
  }

  // Summary
  const totalNeeded =
    securityNeeded.length +
    rewardsNeeded.length +
    preferencesNeeded.length +
    billingNeeded.length +
    analyticsNeeded.length +
    agentNeeded.length;
  const totalMissing =
    securityMissing.length +
    rewardsMissing.length +
    preferencesMissing.length +
    billingMissing.length +
    analyticsMissing.length +
    agentMissing.length;
  const totalExists = totalNeeded - totalMissing;

  console.log('\n=== SUMMARY ===');
  console.log('📊 DASHBOARD COLLECTIONS NEEDED:', totalNeeded);
  console.log(
    '✅ EXISTS:',
    totalExists,
    '(' + Math.round((totalExists / totalNeeded) * 100) + '%)'
  );
  console.log(
    '❌ MISSING:',
    totalMissing,
    '(' + Math.round((totalMissing / totalNeeded) * 100) + '%)'
  );

  console.log('\n=== PRIORITY MISSING COLLECTIONS (User Mentioned) ===');
  console.log('🔐 2FA & Security Features:');
  console.log('   - twofactorauthentication');
  console.log('   - trusteddevices');
  console.log('   - loginhistory');
  console.log('   - passwordchangelogs');

  console.log('🏆 Rewards & Achievements:');
  console.log('   - achievements');
  console.log('   - rewardpoints');
  console.log('   - badges');
  console.log('   - levelsystem');

  await client.close();
}

checkMissingCollections().catch(console.error);
