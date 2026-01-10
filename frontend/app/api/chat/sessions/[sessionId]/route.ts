import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

interface ChatSession {
  _id?: ObjectId;
  id: string;
  userId: string;
  name: string;
  agentId?: string;
  subscriptionId?: string; // Reference to the active subscription
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

// Authenticate user from request cookies
async function authenticateUser(
  request: NextRequest
): Promise<{ userId: string; db: any } | { error: string; status: number }> {
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) {
    return { error: 'No session ID', status: 401 };
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return { error: 'Invalid or expired session', status: 401 };
    }

    return { userId: sessionUser._id.toString(), db };
  } catch (dbError) {
    console.error('[chat/sessions/id] MongoDB error:', dbError);
    return { error: 'Database error', status: 500 };
  }
}

// Check if user has active subscription for specific agent
async function checkAgentSubscription(
  db: any,
  userId: string,
  agentId: string
): Promise<boolean> {
  try {
    const subscriptions = db.collection('subscriptions');

    // Check if user has active subscription for this agent
    const activeSubscription = await subscriptions.findOne({
      user: userId,
      agentId: agentId,
      status: 'active',
      'billing.currentPeriodEnd': { $gt: new Date() }
    });

    return !!activeSubscription;
  } catch (error) {
    console.error('[chat/sessions/id] Subscription check error:', error);
    return false;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - Get session with messages (from MongoDB)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId, db } = auth;

  try {
    const { sessionId } = await params;
    const sessionsCollection = db.collection('chat_sessions');

    let session = await sessionsCollection.findOne({ id: sessionId, userId });

    // Check if session exists and is not deleted
    if (session && session.deleted) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Auto-create session if it doesn't exist
    if (!session) {
      const now = new Date().toISOString();
      session = {
        id: sessionId,
        userId,
        name: 'New Conversation',
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      await sessionsCollection.insertOne(session);
      console.log(
        '[chat/sessions/id] Auto-created session in MongoDB:',
        sessionId
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        agentId: session.agentId,
        messages: session.messages || [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
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

// POST - Add message to session (in MongoDB)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId, db } = auth;

  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { role, content, attachments, agentId } = body;

    if (!role || !content) {
      return NextResponse.json(
        { success: false, error: 'Role and content required' },
        { status: 400 }
      );
    }

    // Validate agent subscription if agentId is provided
    if (agentId) {
      const hasSubscription = await checkAgentSubscription(db, userId, agentId);
      if (!hasSubscription) {
        return NextResponse.json(
          { success: false, error: 'No active subscription for this agent' },
          { status: 403 }
        );
      }
    }

    const sessionsCollection = db.collection('chat_sessions');

    // Check if session exists
    let session = await sessionsCollection.findOne({ id: sessionId, userId });

    // Don't allow adding messages to deleted sessions
    if (session && session.deleted) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: now,
      attachments: attachments || undefined,
    };

    if (!session) {
      // Get the active subscription for this agent to link it to the session
      let subscriptionId: string | undefined;
      if (agentId) {
        const subscriptions = db.collection('subscriptions');
        const activeSub = await subscriptions.findOne({
          user: userId,
          agentId: agentId,
          status: 'active',
          'billing.currentPeriodEnd': { $gt: new Date() }
        });
        subscriptionId = activeSub?._id?.toString();
      }

      // Create new session with the first message
      const sessionCount = await sessionsCollection.countDocuments({ userId });
      session = {
        id: sessionId,
        userId,
        name:
          role === 'user'
            ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
            : `Conversation ${sessionCount + 1}`,
        agentId: agentId || undefined,
        subscriptionId: subscriptionId, // Link to active subscription
        messages: [message],
        createdAt: now,
        updatedAt: now,
      };
      await sessionsCollection.insertOne(session);
      console.log(
        '[chat/sessions/id] Created session with first message:',
        sessionId
      );
    } else {
      // Update existing session - add message
      const updateData: Record<string, unknown> = {
        $push: { messages: message },
        $set: { updatedAt: now },
      };

      // Update name if first user message
      if (session.messages.length === 0 && role === 'user') {
        (updateData.$set as Record<string, unknown>).name =
          content.slice(0, 50) + (content.length > 50 ? '...' : '');
      }

      // Update agentId if provided and not set
      if (agentId && !session.agentId) {
        (updateData.$set as Record<string, unknown>).agentId = agentId;
      }

      await sessionsCollection.updateOne({ id: sessionId, userId }, updateData);
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete session (from MongoDB)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId, db } = auth;

  try {
    const { sessionId } = await params;
    const sessionsCollection = db.collection('chat_sessions');

    const now = new Date().toISOString();
    const result = await sessionsCollection.findOneAndUpdate(
      { id: sessionId, userId },
      { $set: { deleted: true, updatedAt: now } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

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
