// Note: This project now uses PostgreSQL via Prisma instead of MongoDB
// This file is deprecated - use Prisma Studio or pgAdmin for database monitoring

import { PrismaClient } from '@prisma/client';

async function monitorDatabasePerformance() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('🚀 Connected to PostgreSQL for performance monitoring');

    // Get database stats
    console.log('\n📊 DATABASE STATISTICS:');
    
    // Count records in main tables
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    const subscriptionCount = await prisma.subscription.count();
    const chatCount = await prisma.chatConversation.count();
    
    console.log(`- Users: ${userCount}`);
    console.log(`- Sessions: ${sessionCount}`);
    console.log(`- Subscriptions: ${subscriptionCount}`);
    console.log(`- Chat Conversations: ${chatCount}`);

    // Get table row counts
    console.log('\n📁 TABLE ROW COUNTS:');
    const tables = [
      { name: 'User', count: userCount },
      { name: 'Session', count: sessionCount },
      { name: 'Subscription', count: subscriptionCount },
      { name: 'ChatConversation', count: chatCount },
    ];
    
    tables.forEach((table) => {
      console.log(`- ${table.name}: ${table.count} rows`);
    });

    // Check database health
    console.log('\n🔍 DATABASE HEALTH CHECK:');
    
    // Test query performance
    const startTime = Date.now();
    await prisma.user.findFirst();
    const queryTime = Date.now() - startTime;
    
    console.log(`- ✅ Query latency: ${queryTime}ms`);
    console.log('- ✅ Prisma ORM connected');
    console.log('- 📝 Recommendation: Monitor slow queries in AWS RDS dashboard');

    // Connection info
    console.log('\n🔌 CONNECTION INFO:');
    console.log('- Database: PostgreSQL (AWS RDS)');
    console.log('- ORM: Prisma');
    console.log('- Host: maulaai-db.c3oiwgyy4oo1.ap-southeast-1.rds.amazonaws.com');

    // Performance recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
    console.log('1. ✅ Monitor slow queries in AWS RDS Performance Insights');
    console.log('2. ✅ Set up CloudWatch alerts for connection limits');
    console.log('3. ✅ Consider read replicas for high read loads');
    console.log('4. ✅ Use Prisma migrations for schema changes');
    console.log('5. 📅 Configure automated backups in RDS');

    console.log('\n🎉 Performance monitoring complete!');
  } catch (error) {
    console.error('❌ Error monitoring performance:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from PostgreSQL');
  }
}

monitorDatabasePerformance();
