import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Authenticate user from request cookies
async function authenticateUser(
  request: NextRequest
): Promise<{ userId: string } | { error: string; status: number }> {
  const sessionId = getSessionId(request);

  console.log(
    '[chat/sessions] Auth check - session_id cookie:',
    sessionId ? 'present' : 'missing'
  );

  if (!sessionId) {
    return { error: 'No session ID', status: 401 };
  }

  try {
    const sessionUser = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() },
      },
      select: { id: true }
    });

    console.log(
      '[chat/sessions] PostgreSQL session lookup:',
      sessionUser ? 'found user' : 'no user found'
    );

    if (!sessionUser) {
      return { error: 'Invalid or expired session', status: 401 };
    }

    return { userId: sessionUser.id };
  } catch (dbError) {
    console.error('[chat/sessions] PostgreSQL error:', dbError);
    return { error: 'Database error', status: 500 };
  }
}

// Check if user has active subscription for specific agent
async function checkAgentSubscription(
  userId: string,
  agentId: string
): Promise<boolean> {
  try {
    const activeSubscription = await prisma.agentSubscription.findFirst({
      where: {
        userId: userId,
        agentId: agentId,
        status: 'active',
        expiryDate: { gt: new Date() },
      },
    });

    if (activeSubscription) {
      console.log(
        '[chat/sessions] Found active subscription for user:',
        userId,
        'agent:',
        agentId
      );
      return true;
    }

    console.log(
      '[chat/sessions] No active subscription found for user:',
      userId,
      'agent:',
      agentId
    );
    return false;
  } catch (error) {
    console.error('[chat/sessions] Subscription check error:', error);
    return false;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List all sessions for user
export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    // Skip subscription check for ai-studio (Canvas/Studio tool is free for authenticated users)
    const freeAgentIds = ['ai-studio', 'studio', 'canvas'];
    const requiresSubscription = agentId && !freeAgentIds.includes(agentId.toLowerCase());

    // Validate agent subscription if agentId is specified (excluding free tools)
    if (requiresSubscription) {
      const hasSubscription = await checkAgentSubscription(userId, agentId);
      if (!hasSubscription) {
        return NextResponse.json(
          { success: false, error: 'No active subscription for this agent' },
          { status: 403 }
        );
      }
    }

    // Build query
    const where: Record<string, unknown> = { userId, isArchived: false };
    if (agentId) {
      where.agentId = agentId;
    }

    // Fetch sessions with messages
    const sessions = await prisma.chatSession.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s.sessionId,
        name: s.name,
        agentId: s.agentId,
        messageCount: s._count.messages,
        lastMessage: s.messages[0]?.content?.slice(0, 100) || '',
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create new session
export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const body = await request.json();
    const { name, agentId } = body;

    // Skip subscription check for ai-studio
    const freeAgentIds = ['ai-studio', 'studio', 'canvas'];
    const requiresSubscription = agentId && !freeAgentIds.includes(agentId.toLowerCase());

    // Validate agent subscription before creating session
    if (requiresSubscription) {
      const hasSubscription = await checkAgentSubscription(userId, agentId);
      if (!hasSubscription) {
        return NextResponse.json(
          { success: false, error: 'No active subscription for this agent' },
          { status: 403 }
        );
      }
    }

    // Count existing sessions for naming
    const sessionCount = await prisma.chatSession.count({ where: { userId } });

    const sessionId = generateId();
    
    const session = await prisma.chatSession.create({
      data: {
        sessionId,
        userId,
        name: name || `Conversation ${sessionCount + 1}`,
        agentId: agentId || null,
      }
    });

    console.log('[chat/sessions] Created new session in PostgreSQL:', session.sessionId);

    return NextResponse.json({
      success: true,
      session: {
        id: session.sessionId,
        name: session.name,
        agentId: session.agentId,
        messageCount: 0,
        lastMessage: '',
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PUT - Update session (rename)
export async function PUT(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const body = await request.json();
    const { sessionId, name } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.updateMany({
      where: { sessionId, userId },
      data: { name, updatedAt: new Date() },
    });

    if (session.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const updatedSession = await prisma.chatSession.findFirst({
      where: { sessionId, userId }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession?.sessionId,
        name: updatedSession?.name,
        updatedAt: updatedSession?.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete session (soft delete by archiving)
export async function DELETE(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const result = await prisma.chatSession.updateMany({
      where: { sessionId, userId },
      data: { isArchived: true, archivedAt: new Date() },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[chat/sessions] Archived session:', sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
