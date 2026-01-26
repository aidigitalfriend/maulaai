import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user ID from session cookie
async function getUserId(): Promise<string | null> {
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

// GET - Fetch user's canvas chat messages
// Uses ChatCanvasHistory table to store message history by project
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      // Return empty for non-authenticated users (they use localStorage)
      return NextResponse.json({
        success: true,
        messages: []
      });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Get messages from ChatCanvasHistory for this user's latest project
    const history = await prisma.chatCanvasHistory.findMany({
      where: { 
        userId,
        ...(projectId ? { projectId } : {})
      },
      orderBy: { createdAt: 'asc' },
      take: 100 // Limit to last 100 messages
    });

    // Convert history entries to message format
    const messages = history.map(h => ({
      id: h.id,
      role: h.name?.startsWith('user:') ? 'user' : 'assistant',
      content: h.prompt || '',
      timestamp: h.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching canvas messages:', error);
    // Return empty array on error - localStorage is the primary store
    return NextResponse.json({
      success: true,
      messages: []
    });
  }
}

// POST - Save canvas chat messages
// Stores in ChatCanvasHistory for persistence
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      // Non-authenticated users use localStorage only
      return NextResponse.json({
        success: true,
        message: 'Using localStorage for non-authenticated users'
      });
    }

    const body = await request.json();
    const { messages, projectId } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({
        success: false,
        error: 'Messages must be an array'
      }, { status: 400 });
    }

    // Store the latest messages in ChatCanvasHistory
    // First, get or create a project for this user
    let project = await prisma.chatCanvasProject.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!project) {
      project = await prisma.chatCanvasProject.create({
        data: {
          userId,
          name: 'Canvas Messages',
          description: 'Canvas chat messages storage'
        }
      });
    }

    // Clear existing history for this project and add new messages
    await prisma.chatCanvasHistory.deleteMany({
      where: { 
        userId,
        projectId: projectId || project.id
      }
    });

    // Insert new messages
    if (messages.length > 0) {
      await prisma.chatCanvasHistory.createMany({
        data: messages.slice(-50).map((msg: { role?: string; content?: string; id?: string }) => ({
          userId,
          projectId: projectId || project!.id,
          name: `${msg.role || 'user'}:${msg.id || Date.now()}`,
          prompt: msg.content || '',
          code: ''
        }))
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Messages saved successfully'
    });
  } catch (error) {
    console.error('Error saving canvas messages:', error);
    // Don't fail - localStorage is primary, this is just backup
    return NextResponse.json({
      success: true,
      message: 'Using localStorage fallback'
    });
  }
}

// DELETE - Clear canvas chat messages
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json({
        success: true,
        message: 'Using localStorage for non-authenticated users'
      });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    await prisma.chatCanvasHistory.deleteMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {})
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Messages cleared'
    });
  } catch (error) {
    console.error('Error clearing canvas messages:', error);
    return NextResponse.json({
      success: true,
      message: 'Using localStorage fallback'
    });
  }
}
