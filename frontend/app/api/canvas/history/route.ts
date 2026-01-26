import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user ID from session cookie
async function getUserId(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;
  
  if (!sessionId) return null;
  
  try {
    const user = await prisma.user.findFirst({
      where: { sessionId },
      select: { id: true }
    });
    return user?.id || null;
  } catch {
    return null;
  }
}

// GET - Fetch user's canvas history
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        history: []
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const history = await prisma.chatCanvasHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        prompt: true,
        code: true,
        createdAt: true,
        metadata: true
      }
    });

    const total = await prisma.chatCanvasHistory.count({ where: { userId } });

    return NextResponse.json({
      success: true,
      history: history.map(h => ({
        id: h.id,
        name: h.name,
        prompt: h.prompt,
        code: h.code,
        timestamp: h.createdAt.getTime(),
        metadata: h.metadata
      })),
      total,
      hasMore: offset + history.length < total
    });
  } catch (error) {
    console.error('Error fetching canvas history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch history',
      history: []
    }, { status: 500 });
  }
}

// POST - Create new history entry
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, prompt, code, sessionId, metadata } = body;

    if (!prompt || !code) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and code'
      }, { status: 400 });
    }

    const entry = await prisma.chatCanvasHistory.create({
      data: {
        userId,
        sessionId: sessionId || null,
        name: name || 'Untitled',
        prompt,
        code,
        metadata: metadata || {}
      }
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        name: entry.name,
        prompt: entry.prompt,
        code: entry.code,
        timestamp: entry.createdAt.getTime()
      }
    });
  } catch (error) {
    console.error('Error creating canvas history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save history'
    }, { status: 500 });
  }
}

// DELETE - Delete history entry
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing history entry ID'
      }, { status: 400 });
    }

    // Verify ownership
    const entry = await prisma.chatCanvasHistory.findFirst({
      where: { id, userId }
    });

    if (!entry) {
      return NextResponse.json({
        success: false,
        error: 'History entry not found'
      }, { status: 404 });
    }

    await prisma.chatCanvasHistory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'History entry deleted'
    });
  } catch (error) {
    console.error('Error deleting canvas history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete history'
    }, { status: 500 });
  }
}

// PATCH - Update history entry (rename)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing history entry ID'
      }, { status: 400 });
    }

    // Verify ownership
    const entry = await prisma.chatCanvasHistory.findFirst({
      where: { id, userId }
    });

    if (!entry) {
      return NextResponse.json({
        success: false,
        error: 'History entry not found'
      }, { status: 404 });
    }

    const updated = await prisma.chatCanvasHistory.update({
      where: { id },
      data: { name: name || entry.name }
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: updated.id,
        name: updated.name,
        prompt: updated.prompt,
        code: updated.code,
        timestamp: updated.createdAt.getTime()
      }
    });
  } catch (error) {
    console.error('Error updating canvas history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update history'
    }, { status: 500 });
  }
}
