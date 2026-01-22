import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// =====================================================
// Helper: Get User from Session Cookie
// =====================================================
async function getUserFromSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

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
// POST /api/community/posts/[id]/like - Like a post
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
        { success: false, error: 'Authentication required. Please log in to like posts.' },
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

    // Check if already liked
    const existingLike = await prisma.communityLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Already liked this post' },
        { status: 400 }
      );
    }

    // Create like and update count in transaction
    await prisma.$transaction([
      prisma.communityLike.create({
        data: {
          userId: user.id,
          postId: postId,
        },
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    const updatedPost = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { likesCount: true },
    });

    console.log(`❤️ Post ${postId} liked by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Post liked successfully',
      data: {
        postId,
        liked: true,
        likesCount: updatedPost?.likesCount || 0,
      },
    });
  } catch (error: any) {
    // Handle unique constraint violation (race condition)
    if (error.code === 'P2002') {
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
