import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const AGENT_MAP: Record<
  string,
  { name: string; type: string; avatar: string }
> = {
  einstein: { name: 'Einstein', type: 'Physics & Science', avatar: '🧠' },
  'tech-wizard': {
    name: 'Tech Wizard',
    type: 'Technology & Programming',
    avatar: '🧙‍♂️',
  },
  'comedy-king': {
    name: 'Comedy King',
    type: 'Entertainment & Humor',
    avatar: '😄',
  },
  'chef-biew': { name: 'Chef Biew', type: 'Cooking & Recipes', avatar: '👨‍🍳' },
  'ben-sega': {
    name: 'Ben Sega',
    type: 'Gaming & Entertainment',
    avatar: '🎮',
  },
  default: { name: 'AI Assistant', type: 'General Purpose', avatar: '🤖' },
};

function resolveAgent(agentId?: string) {
  if (!agentId) {
    return AGENT_MAP.default;
  }
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
  { params }: { params: { agentId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    // Find user by session using Prisma
    const sessionUser = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() }
      }
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
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

    const previousPeriodStart = new Date(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );

    const agentInfo = resolveAgent(params.agentId);

    // Get current period stats using Prisma
    const currentInteractions = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        OR: [
          { agentId: { contains: params.agentId, mode: 'insensitive' } }
        ],
        startedAt: { gte: startDate }
      }
    });

    // Calculate stats from interactions
    const totalConversations = currentInteractions.length;
    let totalMessages = 0;
    let totalResponseTime = 0;
    const uniqueUserIds = new Set<string>();

    currentInteractions.forEach((interaction: typeof currentInteractions[0]) => {
      const messages = interaction.messages as any[];
      totalMessages += messages?.length || 0;
      totalResponseTime += interaction.durationMs || 0;
      if (interaction.userId) {
        uniqueUserIds.add(interaction.userId);
      }
    });

    const avgResponseTime = totalConversations > 0 
      ? totalResponseTime / totalConversations / 1000 // Convert to seconds
      : 1.2;

    // Get previous period stats
    const previousInteractions = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        OR: [
          { agentId: { contains: params.agentId, mode: 'insensitive' } }
        ],
        startedAt: { gte: previousPeriodStart, lt: startDate }
      }
    });

    const prevTotalConversations = previousInteractions.length;
    let prevTotalMessages = 0;
    let prevTotalResponseTime = 0;

    previousInteractions.forEach((interaction: typeof previousInteractions[0]) => {
      const messages = interaction.messages as any[];
      prevTotalMessages += messages?.length || 0;
      prevTotalResponseTime += interaction.durationMs || 0;
    });

    const prevAvgResponseTime = prevTotalConversations > 0 
      ? prevTotalResponseTime / prevTotalConversations / 1000
      : 1.2;

    const conversationTrend = calculateTrend(totalConversations, prevTotalConversations);
    const messageTrend = calculateTrend(totalMessages, prevTotalMessages);
    const responseTimeTrend = calculateTrend(prevAvgResponseTime, avgResponseTime);

    // Get recent activity
    const recentActivity = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        OR: [
          { agentId: { contains: params.agentId, mode: 'insensitive' } }
        ],
        startedAt: { gte: startDate }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    const transformedActivity = recentActivity.map((activity: typeof recentActivity[0]) => {
      const timestampValue = activity.startedAt;
      const minutesAgo = Math.floor(
        (now.getTime() - timestampValue.getTime()) / (1000 * 60)
      );
      const timeAgo =
        minutesAgo < 60
          ? `${minutesAgo} min ago`
          : `${Math.floor(minutesAgo / 60)} hours ago`;

      const messages = activity.messages as any[];
      const firstMessage = messages?.find(
        (msg: any) => msg.role === 'user'
      );

      const description = firstMessage?.content
        ? `${firstMessage.content.substring(0, 60)}${
            firstMessage.content.length > 60 ? '...' : ''
          }`
        : 'New conversation started';

      return {
        timestamp: timeAgo,
        type: 'conversation',
        description,
        user: activity.userId || 'Anonymous',
      };
    });

    const satisfactionScore = Math.min(
      5,
      4 + (totalConversations / 100) * 0.5
    );

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
        activeUsers: uniqueUserIds.size,
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
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
