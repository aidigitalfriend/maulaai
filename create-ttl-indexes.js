import { MongoClient } from 'mongodb';

async function createTTLIndexes() {
  const uri =
    'mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net/onelastai?retryWrites=true&w=majority&appName=onelastai-co';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🚀 Connected to MongoDB for TTL index creation');

    const db = client.db('onelastai');

    // TTL indexes for automatic data archiving (90 days = 90 * 24 * 60 * 60 seconds)
    const ninetyDays = 90 * 24 * 60 * 60;

    // Chat interactions - keep for 90 days
    console.log('💬 Creating TTL index for chatinteractions (90 days)...');
    try {
      await db
        .collection('chatinteractions')
        .createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: ninetyDays, name: 'chatinteractions_ttl' }
        );
      console.log('✅ Created TTL index for chatinteractions');
    } catch (error) {
      console.log('⚠️ TTL index for chatinteractions may already exist');
    }

    // Security logs - keep for 180 days (6 months)
    const sixMonths = 180 * 24 * 60 * 60;
    console.log('🛡️ Creating TTL index for securityLogs (180 days)...');
    try {
      await db
        .collection('securityLogs')
        .createIndex(
          { timestamp: 1 },
          { expireAfterSeconds: sixMonths, name: 'securityLogs_ttl' }
        );
      console.log('✅ Created TTL index for securityLogs');
    } catch (error) {
      console.log('⚠️ TTL index for securityLogs may already exist');
    }

    // User events - keep for 30 days
    const thirtyDays = 30 * 24 * 60 * 60;
    console.log('📊 Creating TTL index for userevents (30 days)...');
    try {
      await db
        .collection('userevents')
        .createIndex(
          { occurredAt: 1 },
          { expireAfterSeconds: thirtyDays, name: 'userevents_ttl' }
        );
      console.log('✅ Created TTL index for userevents');
    } catch (error) {
      console.log('⚠️ TTL index for userevents may already exist');
    }

    // Tool usages - keep for 60 days
    const sixtyDays = 60 * 24 * 60 * 60;
    console.log('🔧 Creating TTL index for toolusages (60 days)...');
    try {
      await db
        .collection('toolusages')
        .createIndex(
          { occurredAt: 1 },
          { expireAfterSeconds: sixtyDays, name: 'toolusages_ttl' }
        );
      console.log('✅ Created TTL index for toolusages');
    } catch (error) {
      console.log('⚠️ TTL index for toolusages may already exist');
    }

    // API usages - keep for 30 days
    console.log('🔗 Creating TTL index for apiusages (30 days)...');
    try {
      await db
        .collection('apiusages')
        .createIndex(
          { timestamp: 1 },
          { expireAfterSeconds: thirtyDays, name: 'apiusages_ttl' }
        );
      console.log('✅ Created TTL index for apiusages');
    } catch (error) {
      console.log('⚠️ TTL index for apiusages may already exist');
    }

    // Page views - keep for 30 days
    console.log('👁️ Creating TTL index for pageviews (30 days)...');
    try {
      await db
        .collection('pageviews')
        .createIndex(
          { timestamp: 1 },
          { expireAfterSeconds: thirtyDays, name: 'pageviews_ttl' }
        );
      console.log('✅ Created TTL index for pageviews');
    } catch (error) {
      console.log('⚠️ TTL index for pageviews may already exist');
    }

    console.log('✅ TTL indexes created for automatic data archiving!');
    console.log(
      '📅 Data older than specified periods will be automatically deleted'
    );
    console.log('🎉 Data archiving setup complete!');
  } catch (error) {
    console.error('❌ Error creating TTL indexes:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTTLIndexes();
