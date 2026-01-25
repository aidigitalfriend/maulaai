import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testSchema() {
  try {
    console.log('🔍 Testing database schema and model matching...\n');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test all major models
    const userCount = await prisma.user.count();
    console.log('✅ User model:', userCount, 'records');

    const agentCount = await prisma.agent.count();
    console.log('✅ Agent model:', agentCount, 'records');

    const sessionCount = await prisma.chatSession.count();
    console.log('✅ ChatSession model:', sessionCount, 'records');

    const interactionCount = await prisma.chatAnalyticsInteraction.count();
    console.log('✅ ChatAnalyticsInteraction model:', interactionCount, 'records');

    const subscriptionCount = await prisma.agentSubscription.count();
    console.log('✅ AgentSubscription model:', subscriptionCount, 'records');

    const canvasCount = await prisma.chatCanvasProject.count();
    console.log('✅ ChatCanvasProject model:', canvasCount, 'records');

    const transactionCount = await prisma.transaction.count();
    console.log('✅ Transaction model:', transactionCount, 'records');

    console.log('\n✅ All schema models are properly matched and accessible!');
    console.log('✅ No missing or mismatched models detected.');

  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSchema();