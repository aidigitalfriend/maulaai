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
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Authenticate user from request cookies
async function authenticateUser(
  request: NextRequest
): Promise<{ userId: string; db: any } | { error: string; status: number }> {
  const sessionId = request.cookies.get('session_id')?.value;

  console.log(
    '[chat/sessions] Auth check - session_id cookie:',
    sessionId ? 'present' : 'missing'
  );

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

    console.log(
      '[chat/sessions] MongoDB session lookup:',
      sessionUser ? 'found user' : 'no user found'
    );

    if (!sessionUser) {
      return { error: 'Invalid or expired session', status: 401 };
    }

    return { userId: sessionUser._id.toString(), db };
  } catch (dbError) {
    console.error('[chat/sessions] MongoDB error:', dbError);
    return { error: 'Database error', status: 500 };
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List all sessions for user (from MongoDB)
export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId, db } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const sessionsCollection = db.collection('chat_sessions');

    // Build query
    const query: Record<string, unknown> = { userId };
    if (agentId) {
      query.agentId = agentId;
    }

    // Fetch from MongoDB, sorted by updatedAt descending
    const sessions = await sessionsCollection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s: ChatSession) => ({
        id: s.id,
        name: s.name,
        agentId: s.agentId,
        messageCount: s.messages?.length || 0,
        lastMessage:
          s.messages?.[s.messages.length - 1]?.content?.slice(0, 100) || '',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
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

// POST - Create new session (in MongoDB)
export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId, db } = auth;

  try {
    const body = await request.json();
    const { name, agentId } = body;

    const sessionsCollection = db.collection('chat_sessions');

    // Count existing sessions for naming
    const sessionCount = await sessionsCollection.countDocuments({ userId });

    const now = new Date().toISOString();
    const session: ChatSession = {
      id: generateId(),
      userId,
      name: name || `Conversation ${sessionCount + 1}`,
      agentId: agentId || undefined,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    // Insert into MongoDB
    await sessionsCollection.insertOne(session);

    console.log('[chat/sessions] Created new session in MongoDB:', session.id);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        agentId: session.agentId,
        messageCount: 0,
        lastMessage: '',
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
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
  const { userId, db } = auth;

  try {
    const body = await request.json();
    const { sessionId, name } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const sessionsCollection = db.collection('chat_sessions');

    const now = new Date().toISOString();
    const result = await sessionsCollection.findOneAndUpdate(
      { id: sessionId, userId },
      { $set: { name, updatedAt: now } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: result.id,
        name: result.name,
        updatedAt: result.updatedAt,
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

// DELETE - Delete session
export async function DELETE(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId, db } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const sessionsCollection = db.collection('chat_sessions');

    const result = await sessionsCollection.deleteOne({
      id: sessionId,
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[chat/sessions] Deleted session from MongoDB:', sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
