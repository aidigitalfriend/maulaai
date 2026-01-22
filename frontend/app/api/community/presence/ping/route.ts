import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

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
    console.error('❌ Presence API: Database connection failed:', error);
    throw error;
  }
}

// =====================================================
// Mongoose Schemas
// =====================================================
const presenceSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userAvatar: { type: String, default: '👤' },
    lastPing: { type: Date, default: Date.now },
    status: { type: String, enum: ['online', 'away', 'offline'], default: 'online' },
    page: { type: String, default: '/community' },
    userAgent: { type: String },
  },
  { timestamps: true, collection: 'communitypresence' }
);

// Auto-expire presence records after 2 minutes of no ping
presenceSchema.index({ lastPing: 1 }, { expireAfterSeconds: 120 });
presenceSchema.index({ userId: 1 });

const CommunityPresence =
  mongoose.models.CommunityPresence || mongoose.model('CommunityPresence', presenceSchema);

// Session schema for auth
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String },
  userName: { type: String },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  firstName: String,
  avatar: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// =====================================================
// POST /api/community/presence/ping - Update user presence
// =====================================================
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    // Anonymous users get a random session-like ID based on request
    const anonymousId = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        `anon-${Date.now()}`;

    const presenceSessionId = sessionId || `anon-${Buffer.from(anonymousId).toString('base64').slice(0, 16)}`;

    let userName = 'Guest';
    let userId = null;
    let userAvatar = '👤';

    // Try to get user info from session
    if (sessionId) {
      const session = await Session.findOne({
        sessionId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      }).lean();

      if (session) {
        userId = session.userId;
        userName = (session as any).userName || 'Member';

        // Optionally get more user details
        try {
          const user = await User.findById(userId).lean();
          if (user) {
            userName = (user as any).name || (user as any).firstName || userName;
            userAvatar = (user as any).avatar || '👤';
          }
        } catch {
          // User not found, use session info
        }
      }
    }

    // Parse body for additional info
    let page = '/community';
    let status = 'online';
    try {
      const body = await request.json();
      page = body.page || page;
      status = body.status || status;
    } catch {
      // No body or invalid JSON
    }

    // Upsert presence record
    await CommunityPresence.findOneAndUpdate(
      { sessionId: presenceSessionId },
      {
        sessionId: presenceSessionId,
        userId,
        userName,
        userAvatar,
        lastPing: new Date(),
        status,
        page,
        userAgent: request.headers.get('user-agent')?.slice(0, 200) || '',
      },
      { upsert: true, new: true }
    );

    // Get online count
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const onlineCount = await CommunityPresence.countDocuments({
      lastPing: { $gte: oneMinuteAgo },
      status: 'online',
    });

    return NextResponse.json({
      success: true,
      message: 'Presence updated',
      data: {
        sessionId: presenceSessionId,
        status,
        onlineCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Presence ping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}
