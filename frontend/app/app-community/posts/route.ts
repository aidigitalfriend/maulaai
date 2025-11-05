import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// GET /app-community/posts?category=&search=&limit=&before=
export async function GET(req: NextRequest) {
  try {
    const hasMongo = !!process.env.MONGODB_URI
    if (!hasMongo) {
      // Demo data when DB is not configured
      const demo = [
        { _id: 'd1', authorName: 'Alex Chen', authorAvatar: '🧠', content: 'Welcome to the community!', category: 'general', createdAt: new Date(), isPinned: true },
        { _id: 'd2', authorName: 'Priya', authorAvatar: '⚙️', content: 'Share your favorite agent tips here.', category: 'agents', createdAt: new Date(Date.now() - 3600_000), isPinned: false },
      ]
      return NextResponse.json({ success: true, data: demo })
    }

    const [{ default: dbConnect }, { default: CommunityPost }] = await Promise.all([
      import('../../../../backend/lib/mongodb'),
      import('../../../../backend/models/CommunityPost'),
    ])
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const before = searchParams.get('before')

    const query: any = {}
    if (category && ['general', 'agents', 'ideas', 'help'].includes(category)) {
      query.category = category
    }
    if (before) {
      const d = new Date(before)
      if (!isNaN(d.getTime())) {
        query.createdAt = { $lt: d }
      }
    }
    if (search && search.trim().length > 0) {
      query.$or = [
        { content: { $regex: search.trim(), $options: 'i' } },
        { authorName: { $regex: search.trim(), $options: 'i' } },
      ]
    }

    const posts = await CommunityPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ success: true, data: posts })
  } catch (error: any) {
    console.error('App-Community posts GET error:', error)
    // Soft-fail with demo content in dev
    const demo = [
      { _id: 'e1', authorName: 'System', authorAvatar: 'ℹ️', content: 'Demo mode: database unavailable.', category: 'general', createdAt: new Date(), isPinned: false },
    ]
    return NextResponse.json({ success: true, data: demo, demo: true })
  }
}

// POST /app-community/posts
export async function POST(req: NextRequest) {
  try {
    const hasMongo = !!process.env.MONGODB_URI
    if (!hasMongo) {
      const body = await req.json().catch(() => ({} as any))
      const { content, category = 'general', authorName = 'Guest', authorAvatar = '👤' } = body || {}
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
      }
      const post = {
        _id: 'demo-' + Date.now(),
        authorId: null,
        authorName: String(authorName).slice(0, 80),
        authorAvatar: String(authorAvatar || '👤').slice(0, 8),
        content: content.trim(),
        category,
        isPinned: false,
        createdAt: new Date(),
      }
      return NextResponse.json({ success: true, data: post, demo: true })
    }

    const [{ default: dbConnect }, { default: CommunityPost }] = await Promise.all([
      import('../../../../backend/lib/mongodb'),
      import('../../../../backend/models/CommunityPost'),
    ])
    await dbConnect()
    const body = await req.json()
    const { content, category = 'general', authorName, authorAvatar = '👤' } = body || {}

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }
    if (!['general', 'agents', 'ideas', 'help'].includes(category)) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 })
    }

    // Minimal auth gate: require any bearer token header and authorName
    const authHeader = req.headers.get('authorization') || ''
    const hasToken = authHeader.toLowerCase().startsWith('bearer ')
    if (!hasToken || !authorName) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const post = await CommunityPost.create({
      authorId: null,
      authorName: String(authorName).slice(0, 80),
      authorAvatar: String(authorAvatar || '👤').slice(0, 8),
      content: content.trim(),
      category,
      isPinned: false,
    })

    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    console.error('App-Community posts POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 })
  }
}
