import { createClient } from 'redis';

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  console.log('🔍 Testing Redis connection...');
  console.log('Redis URL:', redisUrl.replace(/:[^:]+@/, ':***@'));

  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 10000,
      lazyConnect: false
    }
  });

  try {
    console.log('⏳ Attempting to connect...');

    await client.connect();
    console.log('✅ Redis client connected successfully!');

    // Test basic operations
    console.log('⏳ Testing basic operations...');
    await client.set('test_connection', 'working');
    const value = await client.get('test_connection');
    await client.del('test_connection');

    if (value === 'working') {
      console.log('✅ Redis operations working perfectly!');
      console.log('🚀 Redis Cloud instance is fully operational');
    } else {
      console.log('❌ Redis operations failed - unexpected response');
    }

  } catch (err) {
    console.log('❌ Redis connection failed:', err.message);
    console.log('🔍 Error details:', err.code || 'Unknown error');

    if (err.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - check Redis URL and credentials');
    } else if (err.code === 'ETIMEDOUT') {
      console.log('💡 Connection timed out - check network connectivity');
    } else if (err.message.includes('auth')) {
      console.log('💡 Authentication failed - check Redis credentials');
    }
  } finally {
    try {
      await client.quit();
      console.log('🔌 Connection closed');
    } catch (e) {
      // Ignore quit errors
    }
  }
}

testRedisConnection().catch(console.error);