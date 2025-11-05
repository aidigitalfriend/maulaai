import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../../../backend/lib/mongodb'
import CommunityPost from '../../../../../../backend/models/CommunityPost'
import CommunityComment from '../../../../../../backend/models/CommunityComment'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const postId = params.id
    const body = await req.json()
    const { content, authorName, authorAvatar = '👤' } = body || {}

    if (!postId || !content || !authorName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const post = await CommunityPost.findById(postId)
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    const comment = await CommunityComment.create({
      postId: post._id,
      authorId: null,
      authorName: String(authorName).slice(0, 80),
      authorAvatar: String(authorAvatar || '👤').slice(0, 8),
      content: String(content).trim().slice(0, 3000),
    })

    // increment repliesCount
    await CommunityPost.updateOne({ _id: post._id }, { $inc: { repliesCount: 1 } })

    return NextResponse.json({ success: true, data: comment })
  } catch (error: any) {
    console.error('Community comment POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 })
  }
}
