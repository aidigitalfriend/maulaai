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
    console.log('✅ Community API: Connected to MongoDB');
  } catch (error) {
    console.error('❌ Community API: Database connection failed:', error);
    throw error;
  }
}

// =====================================================
// Mongoose Schemas
// =====================================================
const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    authorAvatar: { type: String, default: '👤', maxlength: 8 },
    authorEmail: { type: String, default: null },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ['general', 'agents', 'ideas', 'help'],
      default: 'general',
      index: true,
    },
    isPinned: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'hidden', 'deleted'],
      default: 'active',
    },
  },
  { 
    timestamps: true,
    collection: 'communityposts'
  }
);

communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });
communityPostSchema.index({ authorId: 1, createdAt: -1 });
communityPostSchema.index({ category: 1, createdAt: -1 });

const CommunityPost =
  mongoose.models.CommunityPost || mongoose.model('CommunityPost', communityPostSchema);

// User schema for lookups
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  avatar: String,
  firstName: String,
  lastName: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

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

    const user = await User.findById(session.userId).lean();
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: (user as any).email || '',
      name: (user as any).name || (user as any).firstName || 'Anonymous User',
      avatar: (user as any).avatar || '👤',
    };
  } catch (error) {
    console.error('Session lookup error:', error);
    return null;
  }
}

// =====================================================
// GET /api/community/posts - Fetch community posts
// =====================================================
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const before = searchParams.get('before'); // For pagination
    const author = searchParams.get('author');

    // Build query
    const query: Record<string, unknown> = { status: { $ne: 'deleted' } };

    if (category && ['general', 'agents', 'ideas', 'help'].includes(category)) {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { content: { $regex: search.trim(), $options: 'i' } },
        { authorName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (author) {
      query.authorName = { $regex: author, $options: 'i' };
    }

    // Cursor-based pagination
    if (before) {
      const date = new Date(before);
      if (!isNaN(date.getTime())) {
        query.createdAt = { $lt: date };
      }
    }

    // Fetch posts sorted by pinned first, then by date
    const posts = await CommunityPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`📋 Community posts fetched: ${posts.length} posts`);

    return NextResponse.json({
      success: true,
      count: posts.length,
      data: posts,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('❌ Community posts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/community/posts - Create a new post
// =====================================================
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user from session
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to post.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, category = 'general' } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Post content must be under 5000 characters' },
        { status: 400 }
      );
    }

    // Validate category
    if (!['general', 'agents', 'ideas', 'help'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create the post
    const post = await CommunityPost.create({
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar || '👤',
      authorEmail: user.email,
      content: content.trim(),
      category,
      isPinned: false,
      likesCount: 0,
      repliesCount: 0,
    });

    console.log(`✅ Community post created by ${user.name}: ${post._id}`);

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    console.error('❌ Community post creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
