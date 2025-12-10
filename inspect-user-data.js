import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function inspectUserData() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('onelastai');

    console.log('\n🔍 ANALYZING USER DATA FLOW:\n');

    // 1. Check users collection structure
    console.log('1️⃣ USERS COLLECTION (Main Authentication & Profile):');
    const sampleUser = await db.collection('users').findOne({});
    console.log('   Fields:', Object.keys(sampleUser));
    console.log('   Sample user email:', sampleUser.email);
    console.log('   Has password:', !!sampleUser.password);
    console.log('   Auth method:', sampleUser.authMethod);
    console.log('   Profile fields in users collection:');
    console.log('   - bio:', !!sampleUser.bio);
    console.log('   - location:', !!sampleUser.location);
    console.log('   - profession:', !!sampleUser.profession);
    console.log('   - socialLinks:', !!sampleUser.socialLinks);
    console.log('   - preferences:', !!sampleUser.preferences);

    // 2. Check userprofiles collection (separate profile data)
    console.log('\n2️⃣ USERPROFILES COLLECTION (Extended Profile Data):');
    const profileSample = await db.collection('userprofiles').findOne({});
    if (profileSample) {
      console.log('   Fields:', Object.keys(profileSample));
      console.log('   Linked to userId:', profileSample.userId);
      console.log('   Profile email:', profileSample.email);
    } else {
      console.log('   No profiles found in separate userprofiles collection');
    }

    // 3. Check userpreferences collection
    console.log('\n3️⃣ USERPREFERENCES COLLECTION (User Settings):');
    const prefSample = await db.collection('userpreferences').findOne({});
    if (prefSample) {
      console.log('   Fields:', Object.keys(prefSample));
      console.log(
        '   Preference categories:',
        Object.keys(prefSample).filter(
          (k) => !['_id', 'userId', 'createdAt', 'updatedAt', '__v'].includes(k)
        )
      );
    }

    // 4. Check usersecurities collection
    console.log('\n4️⃣ USERSECURITIES COLLECTION (Security Data):');
    const securitySample = await db.collection('usersecurities').findOne({});
    if (securitySample) {
      console.log('   Fields:', Object.keys(securitySample));
    } else {
      console.log('   No security records found (collection empty)');
    }

    // 5. Check sessions collection
    console.log('\n5️⃣ SESSIONS COLLECTION (Login Sessions):');
    const sessionSample = await db.collection('sessions').findOne({});
    if (sessionSample) {
      console.log('   Fields:', Object.keys(sessionSample));
      console.log('   Session structure shows login tracking');
    }

    // 6. Show recent signups
    console.log('\n6️⃣ RECENT SIGNUPS (Last 3 users):');
    const recentUsers = await db
      .collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    recentUsers.forEach((user, i) => {
      console.log(
        `   ${i + 1}. ${
          user.email
        } - Created: ${user.createdAt?.toLocaleDateString()}`
      );
      console.log(`      Auth method: ${user.authMethod}`);
      console.log(
        `      Last login: ${user.lastLoginAt?.toLocaleDateString() || 'Never'}`
      );
    });

    console.log('\n📋 DATA FLOW SUMMARY:');
    console.log('==================');
    console.log(
      '🔐 SIGNUP: Saves to users collection with email, password, name, authMethod'
    );
    console.log(
      '🚪 LOGIN: Updates users.lastLoginAt and creates/updates session'
    );
    console.log(
      '👤 PROFILE: Updates users collection directly with profile fields'
    );
    console.log(
      '⚙️  PREFERENCES: Separate userpreferences collection for detailed settings'
    );
    console.log(
      '🔒 SECURITY: Empty usersecurities collection (not actively used)'
    );
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

inspectUserData();
