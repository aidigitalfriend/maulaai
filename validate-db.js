import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function validateDatabase() {
  console.log('🔍 Starting Database Validation...\n');

  try {
    // Check tables
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
    console.log('📊 Database Tables (' + tables.length + '):');
    tables.forEach(table => console.log('  - ' + table.tablename));
    console.log();

    // Check enums
    const enumTypes = await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') ORDER BY typname`;
    console.log('🏷️  Database Enums (' + enumTypes.length + '):');
    enumTypes.forEach(enumType => console.log('  - ' + enumType.typname));
    console.log();

    // Check data counts
    const userCount = await prisma.user.count();
    console.log('👥 Users:', userCount);

    const agentCount = await prisma.agent.count();
    console.log('🤖 Agents:', agentCount);

    const chatCount = await prisma.chatSession.count();
    console.log('💬 Chat Sessions:', chatCount);

    const subCount = await prisma.agentSubscription.count();
    console.log('💳 Subscriptions:', subCount);

    const transCount = await prisma.transaction.count();
    console.log('💰 Transactions:', transCount);

    console.log('\n✅ Database validation completed successfully!');

  } catch (error) {
    console.error('❌ Database validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validateDatabase();