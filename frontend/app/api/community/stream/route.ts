import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// =====================================================
// Database Connection
// =====================================================
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'onelastai',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('❌ Community Stream: Database connection failed:', error);
    throw error;
  }
}

// =====================================================
// Mongoose Schemas (inline for Next.js API routes)
// =====================================================
const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['general', 'agents', 'ideas', 'help'], default: 'general' },
    isPinned: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' },
  },
  { timestamps: true, collection: 'communityposts' }
);

const CommunityPost = mongoose.models.CommunityPost || mongoose.model('CommunityPost', communityPostSchema);

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Presence tracking schema
const presenceSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  lastPing: { type: Date, default: Date.now },
  status: { type: String, enum: ['online', 'away', 'offline'], default: 'online' },
}, { timestamps: true, collection: 'communitypresence' });

presenceSchema.index({ lastPing: 1 }, { expireAfterSeconds: 120 }); // Auto-expire after 2 minutes

const CommunityPresence = mongoose.models.CommunityPresence || mongoose.model('CommunityPresence', presenceSchema);

// =====================================================
// Fetch Real Metrics from Database
// =====================================================
async function fetchMetrics() {
  try {
    await connectToDatabase();

    // Total members (users)
    const totalMembers = await User.countDocuments();

    // Online now (presence within last 60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const onlineNow = await CommunityPresence.countDocuments({
      lastPing: { $gte: oneMinuteAgo },
      status: 'online',
    });

    // Total posts
    const totalPosts = await CommunityPost.countDocuments({ status: { $ne: 'deleted' } });

    // Posts this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const postsThisWeek = await CommunityPost.countDocuments({
      createdAt: { $gte: weekAgo },
      status: { $ne: 'deleted' },
    });

    // Active replies (sum of repliesCount from all posts)
    const replyAgg = await CommunityPost.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: null, total: { $sum: '$repliesCount' } } },
    ]);
    const activeReplies = replyAgg[0]?.total || 0;

    // New members this week
    const newMembersWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    return {
      totalMembers,
      onlineNow: Math.max(1, onlineNow), // At least 1 if someone is viewing
      totalPosts,
      postsThisWeek,
      activeReplies,
      newMembersWeek,
    };
  } catch (error) {
    console.error('Metrics fetch error:', error);
    return {
      totalMembers: 0,
      onlineNow: 1,
      totalPosts: 0,
      postsThisWeek: 0,
      activeReplies: 0,
      newMembersWeek: 0,
    };
  }
}

// =====================================================
// GET /api/community/stream - Server-Sent Events for real-time updates
// =====================================================
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let isConnected = true;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Community stream connected' })}\n\n`)
      );

      // Send initial metrics immediately
      try {
        const metrics = await fetchMetrics();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'metrics', data: metrics })}\n\n`)
        );
      } catch (error) {
        console.error('Initial metrics error:', error);
      }

      // Update metrics every 15 seconds
      const metricsInterval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(metricsInterval);
          return;
        }
        try {
          const metrics = await fetchMetrics();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'metrics', data: metrics })}\n\n`)
          );
        } catch (error) {
          console.error('Metrics update error:', error);
        }
      }, 15000);

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (!isConnected) {
          clearInterval(heartbeatInterval);
          return;
        }
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`)
          );
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        isConnected = false;
        clearInterval(metricsInterval);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable NGINX buffering for SSE
    },
  });
}
