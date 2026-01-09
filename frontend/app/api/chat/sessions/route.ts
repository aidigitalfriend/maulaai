import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientPromise } from '@/lib/mongodb';

// In-memory session store (fallback if no MongoDB)
const sessionStore = new Map<string, Map<string, ChatSession>>();

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
  id: string;
  name: string;
  agentId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      // Fallback to guest mode
      const guestId = cookieStore.get('guest_id')?.value;
      if (guestId) return `guest_${guestId}`;
      return 'guest_default';
    }

    // Verify session with MongoDB
    try {
      const client = await getClientPromise();
      const db = client.db(process.env.MONGODB_DB || 'onelastai');
      const users = db.collection('users');

      const sessionUser = await users.findOne({
        sessionId,
        sessionExpiry: { $gt: new Date() },
      });

      if (sessionUser) {
        return sessionUser._id.toString();
      }
    } catch (dbError) {
      console.error('MongoDB error in getUserId:', dbError);
    }

    // Fallback to guest if session invalid
    return 'guest_default';
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'guest_default';
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List all sessions for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    let userSessions = sessionStore.get(userId);
    if (!userSessions) {
      userSessions = new Map();
      sessionStore.set(userId, userSessions);
    }

    // Convert to array and filter by agentId if provided
    let sessions = Array.from(userSessions.values());
    if (agentId) {
      sessions = sessions.filter((s) => s.agentId === agentId);
    }

    // Sort by updatedAt descending
    sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s.id,
        name: s.name,
        agentId: s.agentId,
        messageCount: s.messages.length,
        lastMessage:
          s.messages[s.messages.length - 1]?.content?.slice(0, 100) || '',
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

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    const body = await request.json();
    const { name, agentId } = body;

    let userSessions = sessionStore.get(userId);
    if (!userSessions) {
      userSessions = new Map();
      sessionStore.set(userId, userSessions);
    }

    const now = new Date().toISOString();
    const session: ChatSession = {
      id: generateId(),
      name: name || `Conversation ${userSessions.size + 1}`,
      agentId: agentId || undefined,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    userSessions.set(session.id, session);

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
  try {
    const userId = await getUserId();

    const body = await request.json();
    const { sessionId, name } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const userSessions = sessionStore.get(userId);
    if (!userSessions) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = userSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (name) {
      session.name = name;
      session.updatedAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        updatedAt: session.updatedAt,
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
  try {
    const userId = await getUserId();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const userSessions = sessionStore.get(userId);
    if (!userSessions) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const deleted = userSessions.delete(sessionId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
