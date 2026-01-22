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
      dbName: process.env.MONGODB_DB || 'maulaai',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('❌ Like API: Database connection failed:', error);
    throw error;
  }
}

// =====================================================
// Mongoose Schemas
// =====================================================
const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['general', 'agents', 'ideas', 'help'], default: 'general' },
    likesCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' },
  },
  { timestamps: true, collection: 'communityposts' }
);

const CommunityPost = mongoose.models.CommunityPost || mongoose.model('CommunityPost', communityPostSchema);

const communityLikeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userEmail: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'communitylikes' }
);

communityLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const CommunityLike = mongoose.models.CommunityLike || mongoose.model('CommunityLike', communityLikeSchema);

// Session schema for auth
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

// =====================================================
// Helper: Get User from Session Cookie
// =====================================================
async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return null;
    }

    await connectToDatabase();

    const session = await Session.findOne({
      sessionId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) {
      return null;
    }

    return {
      id: session.userId.toString(),
      email: (session as any).userEmail || '',
    };
  } catch (error) {
    console.error('Session lookup error:', error);
    return null;
  }
}

// =====================================================
// POST /api/community/posts/[id]/like - Like a post
// =====================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id: postId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Get user from session
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to like posts.' },
        { status: 401 }
      );
    }

    // Check if post exists
    const post = await CommunityPost.findById(postId);
    if (!post || post.status === 'deleted') {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await CommunityLike.findOne({
      postId,
      userId: user.id,
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Already liked this post' },
        { status: 400 }
      );
    }

    // Create like record
    await CommunityLike.create({
      postId,
      userId: user.id,
      userEmail: user.email,
    });

    // Increment likes count
    await CommunityPost.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    const updatedPost = await CommunityPost.findById(postId).lean();

    console.log(`❤️ Post ${postId} liked by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Post liked successfully',
      data: {
        postId,
        liked: true,
        likesCount: (updatedPost as any)?.likesCount || 0,
      },
    });
  } catch (error: any) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Already liked this post' },
        { status: 400 }
      );
    }

    console.error('❌ Like post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}
