import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientPromise } from '@/lib/mongodb';

// Shared session store reference (fallback if no MongoDB)
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

async function getUserId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      const guestId = cookieStore.get('guest_id')?.value;
      if (guestId) return `guest_${guestId}`;
      return 'guest_default';
    }

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

    return 'guest_default';
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'guest_default';
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
  try {
    const userId = await getUserId();
    const { sessionId } = await params;

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

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        agentId: session.agentId,
        messages: session.messages,
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

// POST - Add message to session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const userId = await getUserId();
    const { sessionId } = await params;
    const body = await request.json();
    const { role, content, attachments } = body;

    if (!role || !content) {
      return NextResponse.json(
        { success: false, error: 'Role and content required' },
        { status: 400 }
      );
    }

    let userSessions = sessionStore.get(userId);
    if (!userSessions) {
      userSessions = new Map();
      sessionStore.set(userId, userSessions);
    }

    let session = userSessions.get(sessionId);

    // Auto-create session if it doesn't exist
    if (!session) {
      const now = new Date().toISOString();
      session = {
        id: sessionId,
        name: `Conversation ${userSessions.size + 1}`,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      userSessions.set(sessionId, session);
    }

    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      attachments: attachments || undefined,
    };

    session.messages.push(message);
    session.updatedAt = message.timestamp;

    // Update session name based on first user message
    if (session.messages.length === 1 && role === 'user') {
      session.name = content.slice(0, 50) + (content.length > 50 ? '...' : '');
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

// DELETE - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const userId = await getUserId();
    const { sessionId } = await params;

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
