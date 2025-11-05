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

    const token = authHeader.slice(7)
    const pseudoUserId = new mongoose.Types.ObjectId(
      Buffer.from((await crypto.subtle.digest('SHA-1', new TextEncoder().encode(token))).slice(0, 12) as any)
    )

    const res = await CommunityLike.deleteOne({ postId: post._id, userId: pseudoUserId })
    if (res.deletedCount) {
      await CommunityPost.updateOne({ _id: post._id }, { $inc: { likesCount: -1 } })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Community unlike POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to unlike post' }, { status: 500 })
  }
}
