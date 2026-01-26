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

// GET - Fetch user's canvas chat messages
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        messages: []
      }, { status: 401 });
    }

    // Get user's canvas settings which stores messages
    const settings = await prisma.chatSettings.findFirst({
      where: { 
        userId,
        settingKey: 'canvas_messages'
      }
    });

    if (!settings) {
      return NextResponse.json({
        success: true,
        messages: []
      });
    }

    const messages = typeof settings.settingValue === 'string' 
      ? JSON.parse(settings.settingValue) 
      : settings.settingValue;

    return NextResponse.json({
      success: true,
      messages: Array.isArray(messages) ? messages : []
    });
  } catch (error) {
    console.error('Error fetching canvas messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages',
      messages: []
    }, { status: 500 });
  }
}

// POST - Save canvas chat messages
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
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({
        success: false,
        error: 'Messages must be an array'
      }, { status: 400 });
    }

    // Upsert canvas messages setting
    await prisma.chatSettings.upsert({
      where: {
        userId_settingKey: {
          userId,
          settingKey: 'canvas_messages'
        }
      },
      update: {
        settingValue: JSON.stringify(messages),
        updatedAt: new Date()
      },
      create: {
        userId,
        settingKey: 'canvas_messages',
        settingValue: JSON.stringify(messages)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Messages saved successfully'
    });
  } catch (error) {
    console.error('Error saving canvas messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save messages'
    }, { status: 500 });
  }
}

// DELETE - Clear canvas chat messages
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    await prisma.chatSettings.deleteMany({
      where: {
        userId,
        settingKey: 'canvas_messages'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Messages cleared'
    });
  } catch (error) {
    console.error('Error clearing canvas messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear messages'
    }, { status: 500 });
  }
}
