import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
}

// Authenticate user from request cookies
async function authenticateUser(
  request: NextRequest
): Promise<{ userId: string } | { error: string; status: number }> {
  const sessionId = request.cookies.get('session_id')?.value ||
                    request.cookies.get('sessionId')?.value;

  if (!sessionId) {
    return { error: 'No session ID', status: 401 };
  }

  try {
    const sessionUser = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() }
      }
    });

    if (!sessionUser) {
      return { error: 'Invalid or expired session', status: 401 };
    }

    return { userId: sessionUser.id };
  } catch (dbError) {
    console.error('[chat/sessions/id] Database error:', dbError);
    return { error: 'Database error', status: 500 };
  }
}

// Check if user has active subscription for specific agent
async function checkAgentSubscription(
  userId: string,
  agentId: string
): Promise<boolean> {
  try {
    // Check subscriptions table (AgentSubscription)
    const activeSubscription = await prisma.agentSubscription.findFirst({
      where: {
        userId: userId,
        agentId: agentId,
        status: 'active',
        expiryDate: { gt: new Date() }
      }
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

    // Auto-create session if it doesn't exist (using upsert for race condition safety)
    if (!session) {
      try {
        session = await prisma.chatSession.upsert({
          where: { sessionId },
          update: {}, // No update needed, just return existing
          create: {
            sessionId,
            userId,
            name: 'New Conversation',
            isActive: true
          },
          include: {
            messages: true
          }
        });
        console.log(
          '[chat/sessions/id] Auto-created session:',
          sessionId
        );
      } catch (upsertError: any) {
        // If upsert fails due to race condition, fetch the session
        if (upsertError.code === 'P2002') {
          session = await prisma.chatSession.findFirst({
            where: { sessionId, userId },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' }
              }
            }
          });
        }
        if (!session) {
          throw upsertError;
        }
      }
    }

    // Transform messages to expected format
    const transformedMessages = session.messages.map((msg: typeof session.messages[0]) => ({
      id: msg.id,
      role: msg.role.toLowerCase(),
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      attachments: (msg.metadata as any)?.attachments || undefined
    }));

    return NextResponse.json({
      success: true,
      session: {
        id: session.sessionId,
        name: session.name,
        agentId: session.agentId,
        messages: transformedMessages,
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

    // Validate agent subscription if agentId is provided
    if (agentId) {
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
      where: { sessionId, userId }
    });

    // Don't allow adding messages to archived sessions
    if (session && session.isArchived) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const messageId = generateId();

    // Map role to Prisma enum
    const roleMap: Record<string, 'user' | 'assistant' | 'system'> = {
      user: 'user',
      assistant: 'assistant',
      system: 'system'
    };
    const prismaRole = roleMap[role.toLowerCase()] || 'user';

    if (!session) {
      // Create new session with the first message using upsert to handle race conditions
      const sessionCount = await prisma.chatSession.count({ where: { userId } });
      
      try {
        // Use upsert to handle concurrent session creation attempts
        session = await prisma.chatSession.upsert({
          where: { sessionId },
          update: {
            // If session already exists, just update the timestamp
            updatedAt: now,
            // Update agentId if not set
            ...(agentId ? { agentId } : {})
          },
          create: {
            sessionId,
            userId,
            name: role === 'user'
              ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
              : `Conversation ${sessionCount + 1}`,
            agentId: agentId || null,
            isActive: true,
          }
        });

        console.log(
          '[chat/sessions/id] Upserted session:',
          sessionId
        );
      } catch (upsertError: any) {
        // If upsert fails, try to fetch the existing session
        if (upsertError.code === 'P2002') {
          session = await prisma.chatSession.findFirst({
            where: { sessionId, userId }
          });
          if (!session) {
            throw new Error('Session creation race condition - session not found after conflict');
          }
          console.log('[chat/sessions/id] Found existing session after race condition:', sessionId);
        } else {
          throw upsertError;
        }
      }

      // Create the message separately (since upsert can't do nested creates conditionally)
      await prisma.chatMessage.create({
        data: {
          sessionId: session.sessionId,
          role: prismaRole,
          content,
          metadata: attachments ? { attachments } : {}
        }
      });

      console.log(
        '[chat/sessions/id] Added message to session:',
        sessionId
      );
    } else {
      // Add message to existing session
      await prisma.chatMessage.create({
        data: {
          sessionId: session.sessionId,
          role: prismaRole,
          content,
          metadata: attachments ? { attachments } : {}
        }
      });

      // Update session
      const updateData: any = {
        updatedAt: now
      };

      // Update name if this is the first user message and session has no messages
      const messageCount = await prisma.chatMessage.count({
        where: { sessionId: session.sessionId }
      });
      
      if (messageCount === 1 && role === 'user') {
        updateData.name = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      }

      // Update agentId if provided and not set
      if (agentId && !session.agentId) {
        updateData.agentId = agentId;
      }

      await prisma.chatSession.update({
        where: { id: session.id },
        data: updateData
      });
    }

    const message: ChatMessage = {
      id: messageId,
      role,
      content,
      timestamp: now.toISOString(),
      attachments: attachments || undefined,
    };

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    console.error('[chat/sessions/POST] Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack?.split('\n').slice(0, 5).join('\n')
    });
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete session (soft delete by archiving)
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

    const session = await prisma.chatSession.findFirst({
      where: { sessionId, userId }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Soft delete by archiving
    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('[chat/sessions/id] Soft deleted session:', sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
