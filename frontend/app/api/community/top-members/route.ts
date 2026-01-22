import { NextRequest, NextResponse } from 'next/server';
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
    console.error('❌ Top Members API: Database connection failed:', error);
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
    authorAvatar: { type: String, default: '👤' },
    authorEmail: { type: String },
    content: { type: String, required: true },
    category: { type: String, enum: ['general', 'agents', 'ideas', 'help'], default: 'general' },
    likesCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' },
  },
  { timestamps: true, collection: 'communityposts' }
);

const CommunityPost = mongoose.models.CommunityPost || mongoose.model('CommunityPost', communityPostSchema);

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  firstName: String,
  lastName: String,
  avatar: String,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// =====================================================
// GET /api/community/top-members - Get leaderboard
// =====================================================
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Aggregate top posters by post count and total likes
    const topPosters = await CommunityPost.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$authorId',
          authorName: { $first: '$authorName' },
          avatar: { $first: '$authorAvatar' },
          postsCount: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          lastPost: { $max: '$createdAt' },
          categories: { $addToSet: '$category' },
        },
      },
      {
        $addFields: {
          // Calculate a score based on posts + likes
          score: { $add: [{ $multiply: ['$postsCount', 2] }, '$totalLikes'] },
        },
      },
      { $sort: { score: -1, postsCount: -1 } },
      { $limit: limit },
    ]);

    // Enrich with user data if available
    const enrichedMembers = await Promise.all(
      topPosters.map(async (member) => {
        let userData = null;
        if (member._id) {
          try {
            userData = await User.findById(member._id).lean();
          } catch {
            // User not found
          }
        }

        return {
          _id: member._id?.toString() || member.authorName,
          name: userData?.name || userData?.firstName || member.authorName || 'Anonymous',
          avatar: userData?.avatar || member.avatar || '👤',
          postsCount: member.postsCount,
          totalLikes: member.totalLikes,
          score: member.score,
          title: getBadgeTitle(member.postsCount, member.totalLikes),
          lastPost: member.lastPost,
          topCategories: member.categories?.slice(0, 3) || [],
        };
      })
    );

    console.log(`👥 Top members fetched: ${enrichedMembers.length} members`);

    return NextResponse.json({
      success: true,
      count: enrichedMembers.length,
      data: enrichedMembers,
    });
  } catch (error) {
    console.error('❌ Top members fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top members' },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper: Get badge title based on activity
// =====================================================
function getBadgeTitle(postsCount: number, totalLikes: number): string {
  const score = postsCount * 2 + totalLikes;

  if (score >= 500) return '🏆 Community Legend';
  if (score >= 200) return '⭐ Power Contributor';
  if (score >= 100) return '🚀 Rising Star';
  if (score >= 50) return '💎 Active Member';
  if (score >= 20) return '🔥 Regular';
  if (score >= 5) return '👋 Newcomer';
  return '🌱 New Member';
}
