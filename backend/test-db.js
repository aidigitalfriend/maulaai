import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing database connection...');
console.log('📍 Host:', process.env.DATABASE_URL?.split('@')[1]?.split(':')[0]);
console.log('📊 Database:', process.env.DATABASE_URL?.split('/').pop()?.split('?')[0]);
console.log('🔐 SSL Mode:', process.env.DATABASE_URL?.includes('sslmode') ? 'Enabled' : 'Disabled');

// Test 1: Basic connectivity without SSL
console.log('\n--- Test 1: Basic Connection (No SSL) ---');
const clientNoSSL = new Client({
  host: 'onelastai-db.c3oiwgyy4oo1.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'OnelastAI_2026_Secure!',
  database: 'onelastai',
  connectionTimeoutMillis: 10000,
});

try {
  await clientNoSSL.connect();
  console.log('✅ Basic connection successful!');
  await clientNoSSL.end();
} catch (error) {
  console.log('❌ Basic connection failed:', error.message);
}

// Test 2: SSL connection
console.log('\n--- Test 2: SSL Connection ---');
const clientSSL = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

try {
  await clientSSL.connect();
  console.log('✅ SSL connection successful!');

  const result = await clientSSL.query('SELECT version()');
  console.log('📋 PostgreSQL version:', result.rows[0].version.split(' ')[1]);

  const countResult = await clientSSL.query('SELECT COUNT(*) as user_count FROM "User"');
  console.log('👥 Users in database:', countResult.rows[0].user_count);

  await clientSSL.end();
  console.log('✅ SSL connection test completed successfully');

} catch (error) {
  console.error('❌ SSL connection failed:');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);

  if (error.message.includes('timeout')) {
    console.log('💡 Connection timeout - check security groups and instance status');
  } else if (error.message.includes('authentication')) {
    console.log('💡 Authentication failed - check username/password');
  } else if (error.message.includes('SSL')) {
    console.log('💡 SSL connection failed - try without SSL first');
  }
}