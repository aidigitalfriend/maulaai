import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// =====================================================
// GET /api/community/top-members - Get leaderboard
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Get posts grouped by author with stats
    const topPosters = await prisma.communityPost.groupBy({
      by: ['authorId', 'authorName', 'authorAvatar'],
      _count: { id: true },
      _sum: { likesCount: true },
      _max: { createdAt: true },
      orderBy: [
        { _count: { id: 'desc' } },
      ],
      take: limit,
      where: {
        authorId: { not: null },
      },
    });

    // Enrich with user data and calculate scores
    const enrichedMembers = await Promise.all(
      topPosters.map(async (member) => {
        let userData = null;
        if (member.authorId) {
          userData = await prisma.user.findUnique({
            where: { id: member.authorId },
            select: { name: true, avatar: true },
          });
        }

        const postsCount = member._count.id;
        const totalLikes = member._sum.likesCount || 0;
        const score = postsCount * 2 + totalLikes;

        return {
          _id: member.authorId || member.authorName,
          name: userData?.name || member.authorName || 'Anonymous',
          avatar: userData?.avatar || member.authorAvatar || '👤',
          postsCount,
          totalLikes,
          score,
          title: getBadgeTitle(postsCount, totalLikes),
          lastPost: member._max.createdAt,
        };
      })
    );

    // Sort by score
    enrichedMembers.sort((a, b) => b.score - a.score);

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
