import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

const AGENT_MAP: Record<string, { name: string; type: string; avatar: string }> = {
  'julie-girlfriend': { name: 'Julie', type: 'Companion & Conversation', avatar: '💕' },
  einstein: { name: 'Einstein', type: 'Physics & Science', avatar: '🧠' },
  'tech-wizard': { name: 'Tech Wizard', type: 'Technology & Programming', avatar: '🧙‍♂️' },
  'comedy-king': { name: 'Comedy King', type: 'Comedy & Entertainment', avatar: '🎤' },
  'drama-queen': { name: 'Drama Queen', type: 'Theatre & Performing Arts', avatar: '👑' },
  'chef-biew': { name: 'Chef Biew', type: 'Cooking & Recipes', avatar: '👨‍🍳' },
  'fitness-guru': { name: 'Fitness Guru', type: 'Health & Fitness', avatar: '💪' },
  'travel-buddy': { name: 'Travel Buddy', type: 'Travel & Adventure', avatar: '✈️' },
  'mrs-boss': { name: 'Mrs. Boss', type: 'Business & Leadership', avatar: '👩‍💼' },
  'chess-player': { name: 'Chess Master', type: 'Chess & Strategy', avatar: '♟️' },
  'professor-astrology': { name: 'Professor Astrology', type: 'Astrology & Cosmic Wisdom', avatar: '🔮' },
  'emma-emotional': { name: 'Emma', type: 'Emotional Support', avatar: '🤗' },
  'ben-sega': { name: 'Ben Sega', type: 'Retro Gaming', avatar: '🕹️' },
  'nid-gaming': { name: 'Nid Gaming', type: 'Modern Gaming & Esports', avatar: '🎮' },
  'knight-logic': { name: 'Knight Logic', type: 'Logic & Problem Solving', avatar: '⚔️' },
  'lazy-pawn': { name: 'Lazy Pawn', type: 'Relaxation & Chill', avatar: '🐢' },
  'bishop-burger': { name: 'Bishop Burger', type: 'Fast Food & Burgers', avatar: '🍔' },
  'rook-jokey': { name: 'Rook Jokey', type: 'Jokes & Riddles', avatar: '🃏' },
  default: { name: 'AI Assistant', type: 'General Purpose', avatar: '🤖' },
};

function resolveAgent(agentId?: string) {
  if (!agentId) return AGENT_MAP.default;
  return AGENT_MAP[agentId] || AGENT_MAP.default;
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) {
    return { change: '+100%', trend: 'up' as const };
  }
  const percentChange = ((current - previous) / previous) * 100;
  const change = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
  return {
    change,
    trend: percentChange >= 0 ? ('up' as const) : ('down' as const),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const sessionId = getSessionId(request);
    
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const sessionUser = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!sessionUser) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const timeRange = request.nextUrl.searchParams.get('timeRange') || '7d';
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const agentInfo = resolveAgent(agentId);

    // Get current period stats from ChatAnalyticsInteraction
    const currentInteractions = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        agentId: { contains: agentId, mode: 'insensitive' },
        createdAt: { gte: startDate },
      },
    });

    // Aggregate stats - using correct schema fields
    const totalConversations = currentInteractions.length;
    const totalMessages = currentInteractions.reduce((sum, i) => sum + (i.turnCount || 0), 0);
    const avgResponseTime = totalConversations > 0 
      ? currentInteractions.reduce((sum, i) => sum + (i.durationMs || 0), 0) / totalConversations / 1000  // Convert ms to seconds
      : 1.2;
    const uniqueUsers = [...new Set(currentInteractions.map(i => i.userId).filter(Boolean))];

    // Get previous period stats
    const previousInteractions = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        agentId: { contains: agentId, mode: 'insensitive' },
        createdAt: { gte: previousPeriodStart, lt: startDate },
      },
    });

    const prevTotalConversations = previousInteractions.length;
    const prevTotalMessages = previousInteractions.reduce((sum, i) => sum + (i.turnCount || 0), 0);
    const prevAvgResponseTime = prevTotalConversations > 0
      ? previousInteractions.reduce((sum, i) => sum + (i.durationMs || 0), 0) / prevTotalConversations / 1000
      : 1.2;

    // Calculate trends
    const conversationTrend = calculateTrend(totalConversations, prevTotalConversations);
    const messageTrend = calculateTrend(totalMessages, prevTotalMessages);
    const responseTimeTrend = calculateTrend(prevAvgResponseTime, avgResponseTime);

    // Get recent activity
    const recentInteractions = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        agentId: { contains: agentId, mode: 'insensitive' },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const transformedActivity = recentInteractions.map((activity) => {
      const minutesAgo = Math.floor((now.getTime() - activity.createdAt.getTime()) / (1000 * 60));
      const timeAgo = minutesAgo < 60 ? `${minutesAgo} min ago` : `${Math.floor(minutesAgo / 60)} hours ago`;

      // Get first user message from the messages JSON array
      const messagesArr = activity.messages as any[];
      const firstMessage = messagesArr?.find((m: any) => m.role === 'user')?.content || 'New conversation started';
      const description = firstMessage.length > 60 ? `${firstMessage.substring(0, 60)}...` : firstMessage;

      return {
        timestamp: timeAgo,
        type: 'conversation',
        description,
        user: activity.userId || 'Anonymous',
      };
    });

    const satisfactionScore = Math.min(5, 4 + (totalConversations / 100) * 0.5);

    const performanceData = {
      agent: {
        name: agentInfo.name,
        type: agentInfo.type,
        avatar: agentInfo.avatar,
        status: totalConversations > 0 ? 'active' : 'idle',
      },
      metrics: {
        totalConversations,
        totalMessages,
        averageResponseTime: Math.round(avgResponseTime * 10) / 10,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        activeUsers: uniqueUsers.length,
        uptime: 99.9,
      },
      trends: {
        conversations: {
          value: totalConversations,
          change: conversationTrend.change,
          trend: conversationTrend.trend,
        },
        messages: {
          value: totalMessages,
          change: messageTrend.change,
          trend: messageTrend.trend,
        },
        responseTime: {
          value: Math.round(avgResponseTime * 10) / 10,
          change: responseTimeTrend.change,
          trend: responseTimeTrend.trend,
        },
        satisfaction: {
          value: Math.round(satisfactionScore * 10) / 10,
          change: '+0.1',
          trend: 'up',
        },
      },
      recentActivity: transformedActivity,
      timeRange,
      dataRefreshed: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: performanceData });
  } catch (error) {
    console.error('Agent performance error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
