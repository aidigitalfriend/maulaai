import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Helper to authenticate user from session cookie
async function authenticateUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) {
    return null;
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return null;
    }

    // Verify session exists in sessions collection
    const session = await db.collection('sessions').findOne({
      sessionId: sessionId,
    });

    if (!session || !session.userId) {
      return null;
    }

    // Get user from users collection
    const user = await db.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(session.userId),
    });

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// POST /api/chat/interactions - Save chat interaction
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, agentId, messages, summary, metrics } = body;

    // Validate required fields
    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'conversationId is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'messages array is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Create interaction document
    const interaction = {
      conversationId,
      userId: user._id,
      agentId: agentId && mongoose.Types.ObjectId.isValid(agentId)
        ? new mongoose.Types.ObjectId(agentId)
        : undefined,
      messages: messages.map((msg: { role: string; content: string; timestamp?: number }) => ({
        role: msg.role,
        content: msg.content,
        createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      })),
      summary,
      metrics,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to chatinteractions collection
    const result = await db.collection('chatinteractions').insertOne(interaction);

    return NextResponse.json({
      success: true,
      interaction: {
        id: result.insertedId,
        conversationId,
        messageCount: messages.length,
        createdAt: interaction.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving chat interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save chat interaction' },
      { status: 500 }
    );
  }
}

// GET /api/chat/interactions - Get user's chat interactions
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Build query
    const query: Record<string, unknown> = { userId: user._id };
    if (conversationId) {
      query.conversationId = conversationId;
    }

    const interactions = await db
      .collection('chatinteractions')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      interactions: interactions.map((i) => ({
        id: i._id,
        conversationId: i.conversationId,
        agentId: i.agentId,
        messageCount: i.messages?.length || 0,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching chat interactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat interactions' },
      { status: 500 }
    );
  }
}
