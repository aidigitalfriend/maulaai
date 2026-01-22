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

    if (!sessionId) {
      return null;
    }

    const user = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      name: user.name || 'Anonymous User',
      avatar: user.avatar || '👤',
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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const before = searchParams.get('before');
    const author = searchParams.get('author');

    // Build query conditions
    const where: any = {};

    if (category && ['general', 'agents', 'ideas', 'help'].includes(category)) {
      where.category = category;
    }

    if (search && search.trim()) {
      where.OR = [
        { content: { contains: search.trim(), mode: 'insensitive' } },
        { authorName: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (author) {
      where.authorName = { contains: author, mode: 'insensitive' };
    }

    if (before) {
      const date = new Date(before);
      if (!isNaN(date.getTime())) {
        where.createdAt = { lt: date };
      }
    }

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const transformedPosts = posts.map((post) => ({
      id: post.id,
      _id: post.id,
      authorId: post.authorId,
      authorName: post.authorName,
      authorAvatar: post.authorAvatar,
      content: post.content,
      category: post.category,
      isPinned: post.isPinned,
      likesCount: post._count.likes,
      repliesCount: post._count.comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    console.log(`📋 Community posts fetched: ${posts.length} posts`);

    return NextResponse.json({
      success: true,
      count: posts.length,
      data: transformedPosts,
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
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to post.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, category = 'general' } = body;

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

    if (!['general', 'agents', 'ideas', 'help'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar || '👤',
        content: content.trim(),
        category: category as any,
        isPinned: false,
        likesCount: 0,
        repliesCount: 0,
      },
    });

    console.log(`✅ Community post created by ${user.name}: ${post.id}`);

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      data: { ...post, _id: post.id },
    });
  } catch (error) {
    console.error('❌ Community post creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
