import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

// Force dynamic rendering 
export const dynamic = 'force-dynamic';

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

// Authenticate user from request cookies (same pattern as preferences API)
async function authenticateUser(request: NextRequest): Promise<{ userId: string } | { error: string; status: number }> {
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

    return { userId: sessionUser._id.toString() };
  } catch (dbError) {
    console.error('[chat/sessions/id] MongoDB error:', dbError);
    return { error: 'Database error', status: 500 };
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
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
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
  const auth = await authenticateUser(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  try {
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
