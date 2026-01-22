import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getSessionIdFromCookies } from '@/lib/session-utils';

// =====================================================
// Helper: Get User from Session Cookie
// =====================================================
async function getUserFromSession() {
  try {
    const sessionId = await getSessionIdFromCookies();

    if (!sessionId) return null;

    const user = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() },
        isActive: true,
      },
      select: { id: true, email: true },
    });

    return user ? { id: user.id, email: user.email || '' } : null;
  } catch (error) {
    console.error('Session lookup error:', error);
    return null;
  }
}

// =====================================================
// POST /api/community/posts/[id]/unlike - Unlike a post
// =====================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Get user from session
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to unlike posts.' },
        { status: 401 }
      );
    }

    // Check if post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete like record
    const deleteResult = await prisma.communityLike.deleteMany({
      where: {
        userId: user.id,
        postId: postId,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { success: false, error: 'You have not liked this post' },
        { status: 400 }
      );
    }

    // Decrement likes count (ensure it doesn't go negative)
    await prisma.communityPost.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });

    // Fix negative likes count if any
    await prisma.communityPost.updateMany({
      where: { 
        id: postId,
        likesCount: { lt: 0 },
      },
      data: { likesCount: 0 },
    });

    const updatedPost = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { likesCount: true },
    });

    console.log(`💔 Post ${postId} unliked by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Post unliked successfully',
      data: {
        postId,
        liked: false,
        likesCount: Math.max(0, updatedPost?.likesCount || 0),
      },
    });
  } catch (error) {
    console.error('❌ Unlike post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
