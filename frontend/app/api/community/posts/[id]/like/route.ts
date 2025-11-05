import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../../../backend/lib/mongodb'
import CommunityPost from '../../../../../../backend/models/CommunityPost'
import CommunityLike from '../../../../../../backend/models/CommunityLike'
import mongoose from 'mongoose'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const postId = params.id
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const post = await CommunityPost.findById(postId)
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    // For now, use a synthetic user id derived from token hash to ensure uniqueness per client
    const token = authHeader.slice(7)
    const pseudoUserId = new mongoose.Types.ObjectId(
      Buffer.from((await crypto.subtle.digest('SHA-1', new TextEncoder().encode(token))).slice(0, 12) as any)
    )

    // Upsert like
    const like = await CommunityLike.findOneAndUpdate(
      { postId: post._id, userId: pseudoUserId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // Increment count
    await CommunityPost.updateOne({ _id: post._id }, { $inc: { likesCount: 1 } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Duplicate like is fine
    if (error?.code === 11000) {
      return NextResponse.json({ success: true })
    }
    console.error('Community like POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to like post' }, { status: 500 })
  }
}
