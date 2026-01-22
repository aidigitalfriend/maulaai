import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to authenticate user from session cookie
async function authenticateUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;

  try {
    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// POST /api/chat/interactions - Save chat interaction
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, agentId, messages, summary, metrics } = body;

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ success: false, error: 'conversationId is required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'messages array is required' }, { status: 400 });
    }

    // Save to ChatAnalyticsInteraction using correct schema fields
    const interaction = await prisma.chatAnalyticsInteraction.create({
      data: {
        conversationId,
        userId: user.id,
        agentId: agentId || undefined,
        messages: messages,  // JSON field stores all messages
        turnCount: messages.length,
        durationMs: metrics?.responseTime || 0,
        totalTokens: metrics?.totalTokens || 0,
        keywords: summary ? [summary] : [],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction saved',
      interactionId: interaction.id,
    });
  } catch (error) {
    console.error('Save interaction error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save interaction' }, { status: 500 });
  }
}

// GET /api/chat/interactions - Get user's chat history
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const agentId = searchParams.get('agentId');

    const where: any = { userId: user.id };
    if (agentId) where.agentId = agentId;

    const [interactions, total] = await Promise.all([
      prisma.chatAnalyticsInteraction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chatAnalyticsInteraction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      interactions: interactions.map((i) => ({
        id: i.id,
        conversationId: i.conversationId,
        agentId: i.agentId,
        turnCount: i.turnCount,
        durationMs: i.durationMs,
        createdAt: i.createdAt,
        messages: i.messages,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get interactions error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get interactions' }, { status: 500 });
  }
}
