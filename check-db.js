import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database integrity...\n');

    // Check users
    const userCount = await prisma.user.count();
    console.log('👥 Users:', userCount);

    // Check agents
    const agentCount = await prisma.agent.count();
    console.log('🤖 Agents:', agentCount);

    // Check chat sessions
    const sessionCount = await prisma.chatSession.count();
    console.log('💬 Chat Sessions:', sessionCount);

    // Check chat interactions
    const interactionCount = await prisma.chatAnalyticsInteraction.count();
    console.log('💭 Chat Interactions:', interactionCount);

    // Check subscriptions
    const subscriptionCount = await prisma.agentSubscription.count();
    console.log('💳 Subscriptions:', subscriptionCount);

    // Check transactions
    const transactionCount = await prisma.transaction.count();
    console.log('💰 Transactions:', transactionCount);

    // Sample recent chat interactions
    console.log('\n📝 Recent Chat Interactions:');
    const recentInteractions = await prisma.chatAnalyticsInteraction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        agent: true
      }
    });

    recentInteractions.forEach((interaction, i) => {
      console.log(`${i+1}. ${interaction.user?.email || 'Anonymous'} ↔ ${interaction.agent?.name || 'Unknown'}: ${interaction.messages?.[0]?.content?.substring(0, 50) || 'No message'}...`);
    });

    // Sample recent subscriptions
    console.log('\n💳 Recent Subscriptions:');
    const recentSubs = await prisma.agentSubscription.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        agent: true
      }
    });

    recentSubs.forEach((sub, i) => {
      console.log(`${i+1}. ${sub.user.email} - ${sub.agent.name} (${sub.plan}) - ${sub.status}`);
    });

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();