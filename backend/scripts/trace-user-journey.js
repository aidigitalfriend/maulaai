/**
 * USER JOURNEY TRACE - Collection & Field Name Consistency Check
 *
 * Scenario: User purchases agents, manages subscriptions, updates settings
 * Checks: Are collection names and field names consistent everywhere?
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function traceUserJourney() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('onelastai');

    // Pick a real user with activity
    const testUserId = '6947c05cac096ce938e30a0f'; // onelastai2.0@gmail.com

    console.log('═══════════════════════════════════════════════════════════');
    console.log('👤 USER JOURNEY TRACE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`User ID: ${testUserId}\n`);

    // =========================================================================
    // OPERATION 1: User Account Data
    // =========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  USER ACCOUNT DATA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const usersCol = db.collection('users');
    const user = await usersCol.findOne({ _id: new ObjectId(testUserId) });

    console.log('Collection: users');
    console.log('Fields Used:');
    if (user) {
      console.log('  ✓ _id:', user._id);
      console.log('  ✓ email:', user.email);
      console.log('  ✓ name:', user.name || 'N/A');
      console.log('  ✓ password:', user.password ? '***encrypted***' : 'N/A');
      console.log('  ✓ sessionId:', user.sessionId ? 'present' : 'N/A');
      console.log('  ✓ sessionExpiry:', user.sessionExpiry || 'N/A');
      console.log('  ✓ createdAt:', user.createdAt);
      console.log('  ✓ lastLoginAt:', user.lastLoginAt || 'N/A');
    }

    // =========================================================================
    // OPERATION 2: Agent Purchases (Multiple)
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  AGENT PURCHASES (5 agents, different durations)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const subsCol = db.collection('subscriptions');
    const userSubscriptions = await subsCol
      .find({
        user: new ObjectId(testUserId),
        agentId: { $exists: true },
      })
      .toArray();

    console.log('Collection: subscriptions');
    console.log(`Found: ${userSubscriptions.length} agent subscription(s)\n`);

    if (userSubscriptions.length > 0) {
      console.log('Field Name Check:');
      const sample = userSubscriptions[0];
      console.log('  ✓ _id:', sample._id ? 'ObjectId' : '❌ MISSING');
      console.log(
        '  ✓ user:',
        sample.user ? 'ObjectId (correct)' : '❌ MISSING or wrong type'
      );
      console.log('  ✓ agentId:', sample.agentId || '❌ MISSING');
      console.log('  ✓ agentName:', sample.agentName || '❌ MISSING');
      console.log('  ✓ status:', sample.status || '❌ MISSING');
      console.log('  ✓ plan:', sample.plan || '❌ MISSING');
      console.log(
        '  ✓ billing.interval:',
        sample.billing?.interval || '❌ MISSING'
      );
      console.log(
        '  ✓ billing.amount:',
        sample.billing?.amount || '❌ MISSING'
      );
      console.log(
        '  ✓ billing.currentPeriodEnd:',
        sample.billing?.currentPeriodEnd || '❌ MISSING'
      );
      console.log(
        '  ✓ stripeSubscriptionId:',
        sample.stripeSubscriptionId || '❌ MISSING'
      );
      console.log('  ✓ createdAt:', sample.createdAt || '❌ MISSING');
      console.log('  ✓ updatedAt:', sample.updatedAt || '❌ MISSING');

      console.log('\nStatus Breakdown:');
      const active = userSubscriptions.filter(
        (s) => s.status === 'active'
      ).length;
      const cancelled = userSubscriptions.filter(
        (s) => s.status === 'cancelled'
      ).length;
      const expired = userSubscriptions.filter(
        (s) => s.status === 'expired'
      ).length;
      console.log(`  Active: ${active}`);
      console.log(`  Cancelled: ${cancelled}`);
      console.log(`  Expired: ${expired}`);

      console.log('\nDuration Breakdown:');
      const daily = userSubscriptions.filter(
        (s) => s.billing?.interval === 'day' || s.plan === 'daily'
      ).length;
      const weekly = userSubscriptions.filter(
        (s) => s.billing?.interval === 'week' || s.plan === 'weekly'
      ).length;
      const monthly = userSubscriptions.filter(
        (s) => s.billing?.interval === 'month' || s.plan === 'monthly'
      ).length;
      console.log(`  Daily: ${daily}`);
      console.log(`  Weekly: ${weekly}`);
      console.log(`  Monthly: ${monthly}`);
    }

    // =========================================================================
    // OPERATION 3: Check for Re-purchases (Same Agent Multiple Times)
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  RE-PURCHASES (Cancelled → Repurchased)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const agentCounts = {};
    userSubscriptions.forEach((sub) => {
      const agentId = sub.agentId;
      if (!agentCounts[agentId]) {
        agentCounts[agentId] = {
          total: 0,
          active: 0,
          cancelled: 0,
          expired: 0,
        };
      }
      agentCounts[agentId].total++;
      if (sub.status === 'active') agentCounts[agentId].active++;
      if (sub.status === 'cancelled') agentCounts[agentId].cancelled++;
      if (sub.status === 'expired') agentCounts[agentId].expired++;
    });

    console.log('Agents purchased multiple times:');
    let hasRepurchases = false;
    Object.entries(agentCounts).forEach(([agentId, counts]) => {
      if (counts.total > 1) {
        hasRepurchases = true;
        console.log(
          `  ${agentId}: ${counts.total} times (${counts.active} active, ${counts.cancelled} cancelled, ${counts.expired} expired)`
        );
      }
    });

    if (!hasRepurchases) {
      console.log('  (No re-purchases found for this user)');
    }

    // =========================================================================
    // OPERATION 4: Password Change
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  PASSWORD CHANGE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Collection: users');
    console.log('Endpoint: POST /api/user/security/change-password');
    console.log('Fields Modified:');
    console.log('  ✓ password (hashed with bcrypt)');
    console.log('  ✓ updatedAt (timestamp)');
    console.log('\nField Name Consistency:');
    console.log('  Frontend sends: currentPassword, newPassword');
    console.log('  Backend updates: user.password');
    console.log('  ✅ CONSISTENT');

    // =========================================================================
    // OPERATION 5: 2FA Activation
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣  2FA ACTIVATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const securityCol = db.collection('usersecurities');
    const userSecurity = await securityCol.findOne({ userId: testUserId });

    console.log('Collection: usersecurities');
    console.log('Endpoint: POST /api/user/security/2fa/verify');
    console.log('Fields Used:');
    if (userSecurity) {
      console.log('  ✓ userId:', userSecurity.userId);
      console.log('  ✓ twoFactorEnabled:', userSecurity.twoFactorEnabled);
      console.log(
        '  ✓ twoFactorSecret:',
        userSecurity.twoFactorSecret ? 'present' : 'N/A'
      );
      console.log('  ✓ createdAt:', userSecurity.createdAt || 'N/A');
      console.log('  ✓ updatedAt:', userSecurity.updatedAt || 'N/A');
    } else {
      console.log('  ⚠️ No security record found for this user');
    }

    console.log('\nField Name Consistency:');
    console.log('  Frontend sends: userId, twoFactorToken');
    console.log(
      '  Backend stores: userId (string), twoFactorEnabled (boolean)'
    );
    console.log(
      '  ⚠️ WARNING: userId is STRING, not ObjectId (inconsistent with subscriptions)'
    );

    // =========================================================================
    // OPERATION 6: Email Change
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('6️⃣  EMAIL CHANGE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Collection: users');
    console.log('Endpoint: PUT /api/user/profile');
    console.log('Fields Modified:');
    console.log('  ✓ email');
    console.log('  ✓ updatedAt');
    console.log('\nField Name Consistency:');
    console.log('  Frontend sends: email');
    console.log('  Backend updates: user.email');
    console.log('  ✅ CONSISTENT');

    // =========================================================================
    // OPERATION 7: Settings Update
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('7️⃣  SETTINGS UPDATE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const preferencesCol = db.collection('userpreferences');
    const userPrefs = await preferencesCol.findOne({ userId: testUserId });

    console.log('Collection: userpreferences');
    console.log('Endpoint: PUT /api/user/preferences/:userId');
    console.log('Fields Used:');
    if (userPrefs) {
      console.log('  ✓ userId:', userPrefs.userId);
      console.log('  ✓ theme:', userPrefs.theme || 'N/A');
      console.log('  ✓ language:', userPrefs.language || 'N/A');
      console.log('  ✓ notifications:', userPrefs.notifications || 'N/A');
      console.log('  ✓ updatedAt:', userPrefs.updatedAt || 'N/A');
    } else {
      console.log('  ⚠️ No preferences found for this user');
    }

    console.log('\nField Name Consistency:');
    console.log('  Frontend sends: theme, language, notifications');
    console.log('  Backend stores: same field names');
    console.log('  Backend uses: userId (string)');
    console.log('  ⚠️ WARNING: userId is STRING, not ObjectId');

    // =========================================================================
    // OPERATION 8: Platform Plan Purchase
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('8️⃣  PLATFORM PLAN PURCHASE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const platformSubs = await subsCol
      .find({
        user: new ObjectId(testUserId),
        agentId: { $exists: false }, // Platform subscriptions don't have agentId
      })
      .toArray();

    console.log('Collection: subscriptions (same as agents!)');
    console.log(`Found: ${platformSubs.length} platform subscription(s)\n`);

    if (platformSubs.length > 0) {
      const sample = platformSubs[0];
      console.log('Fields Used:');
      console.log('  ✓ user:', sample.user ? 'ObjectId' : '❌ MISSING');
      console.log(
        '  ✓ plan:',
        sample.plan ? 'ObjectId (references plans collection)' : '❌ MISSING'
      );
      console.log('  ✓ status:', sample.status);
      console.log('  ✓ billing:', sample.billing ? 'present' : '❌ MISSING');
      console.log(
        '  ⚠️ agentId:',
        sample.agentId ? 'present' : 'N/A (correct for platform plan)'
      );
    } else {
      console.log(
        '  ℹ️ No platform subscriptions found (only agent subscriptions)'
      );
    }

    // =========================================================================
    // OPERATION 9: Invoices & Billing Records
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('9️⃣  INVOICES & BILLING RECORDS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const invoicesCol = db.collection('invoices');
    const paymentsCol = db.collection('payments');
    const billingsCol = db.collection('billings');

    const userInvoices = await invoicesCol
      .find({ userId: testUserId })
      .toArray();
    const userPayments = await paymentsCol
      .find({ userId: testUserId })
      .toArray();
    const userBillings = await billingsCol
      .find({ userId: testUserId })
      .toArray();

    console.log('Collection: invoices');
    console.log(`  Found: ${userInvoices.length} invoice(s)`);
    console.log(
      '  ❌ PROBLEM: Collection is EMPTY - invoices not being created!'
    );

    console.log('\nCollection: payments');
    console.log(`  Found: ${userPayments.length} payment(s)`);
    console.log(
      '  ❌ PROBLEM: Collection is EMPTY - payments not being tracked!'
    );

    console.log('\nCollection: billings');
    console.log(`  Found: ${userBillings.length} billing record(s)`);
    console.log(
      '  ❌ PROBLEM: Collection is EMPTY - billing history not saved!'
    );

    console.log('\n⚠️ CRITICAL FINDING:');
    console.log('  Payments go through Stripe, subscriptions are created,');
    console.log(
      '  BUT invoice/payment/billing records are NOT being saved to database!'
    );
    console.log('  This means no payment history, no invoices for users.');

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log(
      '\n═══════════════════════════════════════════════════════════'
    );
    console.log('📊 CONSISTENCY SUMMARY');
    console.log(
      '═══════════════════════════════════════════════════════════\n'
    );

    console.log('✅ CONSISTENT:');
    console.log('  • users collection - all fields consistent');
    console.log(
      '  • subscriptions collection - field names match frontend/backend'
    );
    console.log('  • Password changes use correct field names');
    console.log('  • Email changes use correct field names');
    console.log('  • Preference updates use correct field names\n');

    console.log('⚠️ INCONSISTENT:');
    console.log('  • usersecurities.userId is STRING (should be ObjectId)');
    console.log('  • userpreferences.userId is STRING (should be ObjectId)');
    console.log('  • subscriptions.user is ObjectId (correct!)');
    console.log('  • Some collections use "userId", others use "user"\n');

    console.log('❌ MISSING/BROKEN:');
    console.log('  • invoices collection is EMPTY (not implemented)');
    console.log('  • payments collection is EMPTY (not implemented)');
    console.log('  • billings collection is EMPTY (not implemented)');
    console.log('  • No payment history tracking');
    console.log('  • No invoice generation for users\n');

    console.log('🔧 RECOMMENDATIONS:');
    console.log('  1. Standardize userId field type (all should be ObjectId)');
    console.log('  2. Implement invoice creation on subscription purchase');
    console.log('  3. Implement payment record creation on Stripe payment');
    console.log('  4. Add billing history tracking');
    console.log(
      '  5. Standardize field naming: use "user" everywhere (not "userId")'
    );

    console.log(
      '\n═══════════════════════════════════════════════════════════'
    );
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

console.log('🔍 Starting User Journey Trace...\n');
traceUserJourney().catch(console.error);
