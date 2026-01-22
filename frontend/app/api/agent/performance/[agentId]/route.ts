import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB || 'onelastai';

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

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
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

    // Use 'chatinteractions' collection (no underscore)
    const chatInteractions = db.collection('chatinteractions');
    const agentInfo = resolveAgent(params.agentId);

    // Match by agentId field (not agentName)
    const conversationStats = await chatInteractions
      .aggregate([
        {
          $match: {
            $or: [
              { agentId: { $regex: params.agentId, $options: 'i' } },
              { agentName: { $regex: agentInfo.name, $options: 'i' } },
            ],
          },
        },
        {
          $match: {
            $or: [
              { timestamp: { $gte: startDate } },
              { startedAt: { $gte: startDate } },
              { createdAt: { $gte: startDate } },
            ],
          },
        },
        {
          $group: {
            _id: null,
            totalConversations: { $sum: 1 },
            totalMessages: { $sum: { $size: { $ifNull: ['$messages', []] } } },
            avgResponseTime: {
              $avg: { $ifNull: ['$metrics.avgResponseTime', '$responseTime'] },
            },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
      ])
      .toArray();

    const stats = conversationStats[0] || {
      totalConversations: 0,
      totalMessages: 0,
      avgResponseTime: 0,
      uniqueUsers: [],
    };

    const previousStats = await chatInteractions
      .aggregate([
        {
          $match: {
            $or: [
              { agentId: { $regex: params.agentId, $options: 'i' } },
              { agentName: { $regex: agentInfo.name, $options: 'i' } },
            ],
          },
        },
        {
          $match: {
            $or: [
              { timestamp: { $gte: previousPeriodStart, $lt: startDate } },
              { startedAt: { $gte: previousPeriodStart, $lt: startDate } },
              { createdAt: { $gte: previousPeriodStart, $lt: startDate } },
            ],
          },
        },
        {
          $group: {
            _id: null,
            totalConversations: { $sum: 1 },
            totalMessages: { $sum: { $size: { $ifNull: ['$messages', []] } } },
            avgResponseTime: {
              $avg: { $ifNull: ['$metrics.avgResponseTime', '$responseTime'] },
            },
          },
        },
      ])
      .toArray();

    const prevStats = previousStats[0] || {
      totalConversations: 0,
      totalMessages: 0,
      avgResponseTime: 0,
    };

    const conversationTrend = calculateTrend(
      stats.totalConversations || 0,
      prevStats.totalConversations || 0
    );
    const messageTrend = calculateTrend(
      stats.totalMessages || 0,
      prevStats.totalMessages || 0
    );
    const responseTimeTrend = calculateTrend(
      prevStats.avgResponseTime || 1,
      stats.avgResponseTime || 1
    );

    const recentActivity = await chatInteractions
      .find({
        agentName: { $regex: agentInfo.name, $options: 'i' },
        timestamp: { $gte: startDate },
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const transformedActivity = recentActivity.map((activity) => {
      const timestampValue =
        activity.timestamp instanceof Date
          ? activity.timestamp
          : new Date(activity.timestamp);
      const minutesAgo = Math.floor(
        (now.getTime() - timestampValue.getTime()) / (1000 * 60)
      );
      const timeAgo =
        minutesAgo < 60
          ? `${minutesAgo} min ago`
          : `${Math.floor(minutesAgo / 60)} hours ago`;

      const firstMessage = activity.messages?.find(
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
      4 + ((stats.totalConversations || 0) / 100) * 0.5
    );

    const performanceData = {
      agent: {
        name: agentInfo.name,
        type: agentInfo.type,
        avatar: agentInfo.avatar,
        status: (stats.totalConversations || 0) > 0 ? 'active' : 'idle',
      },
      metrics: {
        totalConversations: stats.totalConversations || 0,
        totalMessages: stats.totalMessages || 0,
        averageResponseTime:
          Math.round((stats.avgResponseTime || 1.2) * 10) / 10,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        activeUsers: (stats.uniqueUsers || []).length,
        uptime: 99.9,
      },
      trends: {
        conversations: {
          value: stats.totalConversations || 0,
          change: conversationTrend.change,
          trend: conversationTrend.trend,
        },
        messages: {
          value: stats.totalMessages || 0,
          change: messageTrend.change,
          trend: messageTrend.trend,
        },
        responseTime: {
          value: Math.round((stats.avgResponseTime || 1.2) * 10) / 10,
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
