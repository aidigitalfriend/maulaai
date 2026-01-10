import { MongoClient } from 'mongodb';

async function createIndexSafely(collection, indexSpec, options = {}) {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`✅ Created index: ${JSON.stringify(indexSpec)}`);
    return true;
  } catch (error) {
    if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
      console.log(`⚠️ Index already exists: ${JSON.stringify(indexSpec)}`);
      return false;
    } else {
      console.error(
        `❌ Error creating index ${JSON.stringify(indexSpec)}:`,
        error.message
      );
      return false;
    }
  }
}

async function createIndexes() {
  const uri =
    'mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net/onelastai?retryWrites=true&w=majority&appName=onelastai-co';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🚀 Connected to MongoDB');

    const db = client.db('onelastai');
    let createdCount = 0;

    // userpreferences
    console.log('📝 Creating indexes for userpreferences collection...');
    if (
      await createIndexSafely(
        db.collection('userpreferences'),
        { userId: 1 },
        { unique: true }
      )
    )
      createdCount++;

    // usersecurities
    console.log('🔒 Creating indexes for usersecurities collection...');
    if (
      await createIndexSafely(
        db.collection('usersecurities'),
        { userId: 1 },
        { unique: true }
      )
    )
      createdCount++;
    if (await createIndexSafely(db.collection('usersecurities'), { email: 1 }))
      createdCount++;

    // notifications
    console.log('🔔 Creating indexes for notifications collection...');
    if (
      await createIndexSafely(db.collection('notifications'), {
        userId: 1,
        read: 1,
        createdAt: -1,
      })
    )
      createdCount++;

    // rewardscenters
    console.log('🎁 Creating indexes for rewardscenters collection...');
    if (
      await createIndexSafely(
        db.collection('rewardscenters'),
        { userId: 1 },
        { unique: true }
      )
    )
      createdCount++;
    if (
      await createIndexSafely(db.collection('rewardscenters'), {
        totalPoints: -1,
      })
    )
      createdCount++;

    // toolusages
    console.log('🔧 Creating indexes for toolusages collection...');
    if (
      await createIndexSafely(db.collection('toolusages'), {
        userId: 1,
        occurredAt: -1,
      })
    )
      createdCount++;
    if (await createIndexSafely(db.collection('toolusages'), { toolName: 1 }))
      createdCount++;

    // userevents
    console.log('📊 Creating indexes for userevents collection...');
    if (
      await createIndexSafely(db.collection('userevents'), {
        userId: 1,
        occurredAt: -1,
      })
    )
      createdCount++;
    if (
      await createIndexSafely(db.collection('userevents'), {
        eventType: 1,
        category: 1,
      })
    )
      createdCount++;

    // contactmessages
    console.log('💬 Creating indexes for contactmessages collection...');
    if (
      await createIndexSafely(db.collection('contactmessages'), {
        status: 1,
        createdAt: -1,
      })
    )
      createdCount++;
    if (await createIndexSafely(db.collection('contactmessages'), { email: 1 }))
      createdCount++;

    // securityLogs
    console.log('🛡️ Creating indexes for securityLogs collection...');
    if (
      await createIndexSafely(db.collection('securityLogs'), {
        userId: 1,
        timestamp: -1,
      })
    )
      createdCount++;
    if (await createIndexSafely(db.collection('securityLogs'), { action: 1 }))
      createdCount++;

    // communityposts
    console.log('🌐 Creating indexes for communityposts collection...');
    if (
      await createIndexSafely(db.collection('communityposts'), { authorId: 1 })
    )
      createdCount++;
    if (
      await createIndexSafely(db.collection('communityposts'), {
        category: 1,
        createdAt: -1,
      })
    )
      createdCount++;
    if (
      await createIndexSafely(db.collection('communityposts'), {
        isPinned: -1,
        createdAt: -1,
      })
    )
      createdCount++;

    // plans
    console.log('📋 Creating indexes for plans collection...');
    if (
      await createIndexSafely(
        db.collection('plans'),
        { slug: 1 },
        { unique: true }
      )
    )
      createdCount++;
    if (
      await createIndexSafely(db.collection('plans'), {
        status: 1,
        'visibility.public': 1,
      })
    )
      createdCount++;

    // coupons
    console.log('🎫 Creating indexes for coupons collection...');
    if (
      await createIndexSafely(
        db.collection('coupons'),
        { code: 1 },
        { unique: true }
      )
    )
      createdCount++;
    if (
      await createIndexSafely(db.collection('coupons'), {
        status: 1,
        'validity.endDate': 1,
      })
    )
      createdCount++;

    console.log(`✅ Successfully created ${createdCount} new indexes!`);
    console.log('🎉 Database performance optimization complete!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createIndexes();
