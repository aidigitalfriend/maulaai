import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory session store (resets on server restart)
const sessionStore = new Map<
  string,
  { messages: any[]; messageCount: number; createdAt: number }
>();
const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes

function getSessionKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.headers.get('x-real-ip') || 'unknown';
  return `session-${ip}`;
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [key, session] of sessionStore.entries()) {
    if (now - session.createdAt > SESSION_EXPIRY) {
      sessionStore.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    cleanupExpiredSessions();
    const sessionKey = getSessionKey(request);
    const session = sessionStore.get(sessionKey);

    if (!session) {
      return NextResponse.json({
        success: true,
        data: {
          isNew: true,
          messages: [],
          messageCount: 0,
          expired: false,
        },
      });
    }

    const now = Date.now();
    const expired = now - session.createdAt > SESSION_EXPIRY;

    if (expired) {
      sessionStore.delete(sessionKey);
      return NextResponse.json({
        success: true,
        data: {
          isNew: false,
          expired: true,
          messages: [],
          messageCount: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isNew: false,
        expired: false,
        messages: session.messages,
        messageCount: session.messageCount,
      },
    });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionKey = getSessionKey(request);

    const existingSession = sessionStore.get(sessionKey);
    const createdAt = existingSession?.createdAt || Date.now();

    sessionStore.set(sessionKey, {
      messages: body.messages || [],
      messageCount: body.messageCount || 0,
      createdAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Session saved',
    });
  } catch (error) {
    console.error('Session POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionKey = getSessionKey(request);
    sessionStore.delete(sessionKey);

    return NextResponse.json({
      success: true,
      message: 'Session cleared',
    });
  } catch (error) {
    console.error('Session DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}