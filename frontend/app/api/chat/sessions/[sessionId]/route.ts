import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Authenticate user from request cookies
async function authenticateUser(
  request: NextRequest
): Promise<{ userId: string } | { error: string; status: number }> {
  const sessionId = request.cookies.get('session_id')?.value;

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

    if (!sessionUser) {
      return { error: 'Invalid or expired session', status: 401 };
    }

    return { userId: sessionUser.id };
  } catch (dbError) {
    console.error('[chat/sessions/id] PostgreSQL error:', dbError);
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
        '[chat/sessions/id] Found active subscription for user:',
        userId,
        'agent:',
        agentId
      );
      return true;
    }

    console.log(
      '[chat/sessions/id] No active subscription found for user:',
      userId,
      'agent:',
      agentId
    );
    return false;
  } catch (error) {
    console.error('[chat/sessions/id] Subscription check error:', error);
    return false;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - Get session with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const { sessionId } = await params;

    let session = await prisma.chatSession.findFirst({
      where: { sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Check if session exists and is not archived
    if (session && session.isArchived) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Auto-create session if it doesn't exist
    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          userId,
          name: 'New Conversation',
        },
        include: {
          messages: true
        }
      });
      console.log(
        '[chat/sessions/id] Auto-created session in PostgreSQL:',
        sessionId
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.sessionId,
        name: session.name,
        agentId: session.agentId,
        messages: session.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.createdAt.toISOString(),
          metadata: m.metadata,
        })),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// POST - Add message to session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { role, content, attachments, agentId } = body;

    console.log('[chat/sessions/POST] Received:', { 
      sessionId, 
      role, 
      contentLength: content?.length || 0, 
      contentPreview: content?.slice(0, 50) || 'EMPTY',
      agentId,
      hasAttachments: !!attachments
    });

    if (!role || !content) {
      // Return success but skip saving - this handles streaming errors gracefully
      console.log('[chat/sessions/POST] Skipping save - empty content (likely streaming error)');
      return NextResponse.json(
        { success: true, skipped: true, reason: 'Empty content' },
        { status: 200 }
      );
    }

    // Skip subscription check for ai-studio
    const freeAgentIds = ['ai-studio', 'studio', 'canvas'];
    const requiresSubscription = agentId && !freeAgentIds.includes(agentId.toLowerCase());

    // Validate agent subscription if agentId is provided
    if (requiresSubscription) {
      const hasSubscription = await checkAgentSubscription(userId, agentId);
      if (!hasSubscription) {
        return NextResponse.json(
          { success: false, error: 'No active subscription for this agent' },
          { status: 403 }
        );
      }
    }

    // Check if session exists
    let session = await prisma.chatSession.findFirst({
      where: { sessionId, userId },
      include: { _count: { select: { messages: true } } }
    });

    // Don't allow adding messages to archived sessions
    if (session && session.isArchived) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Map role to Prisma enum
    const messageRole = role === 'user' ? 'user' : role === 'assistant' ? 'assistant' : 'system';

    if (!session) {
      // Create new session with the first message
      const sessionCount = await prisma.chatSession.count({ where: { userId } });
      
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          userId,
          name: role === 'user'
            ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
            : `Conversation ${sessionCount + 1}`,
          agentId: agentId || null,
          messages: {
            create: {
              role: messageRole,
              content,
              metadata: attachments ? { attachments } : {},
            }
          }
        },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });
      console.log(
        '[chat/sessions/id] Created session with first message:',
        sessionId
      );

      return NextResponse.json({
        success: true,
        message: {
          id: session.messages[0].id,
          role: session.messages[0].role,
          content: session.messages[0].content,
          timestamp: session.messages[0].createdAt.toISOString(),
        },
      });
    } else {
      // Add message to existing session
      const message = await prisma.chatMessage.create({
        data: {
          sessionId: session.sessionId,
          role: messageRole,
          content,
          metadata: attachments ? { attachments } : {},
        }
      });

      // Update session name if first user message and update agentId if needed
      const updateData: Record<string, unknown> = {};
      
      if (session._count.messages === 0 && role === 'user') {
        updateData.name = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      }
      
      if (agentId && !session.agentId) {
        updateData.agentId = agentId;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.chatSession.update({
          where: { id: session.id },
          data: updateData
        });
      }

      return NextResponse.json({
        success: true,
        message: {
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: message.createdAt.toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete session (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
    const { sessionId } = await params;

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

    console.log('[chat/sessions/id] Archived session:', sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
