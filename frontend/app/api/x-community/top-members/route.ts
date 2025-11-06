import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// GET /api/x-community/top-members
export async function GET(req: NextRequest) {
  try {
    const hasMongo = !!process.env.MONGODB_URI
    if (!hasMongo) {
      // Return empty array when DB is not configured
      return NextResponse.json({ success: true, data: [] })
    }

    const [{ default: dbConnect }, { default: User }, { default: CommunityPost }] = await Promise.all([
      import('../../../../../backend/lib/mongodb'),
      import('../../../../../backend/models/User'),
      import('../../../../../backend/models/CommunityPost'),
    ])
    await dbConnect()

    // Get top 10 users by post count
    const topPosters = await CommunityPost.aggregate([
      { $group: { _id: '$authorName', count: { $sum: 1 }, avatar: { $first: '$authorAvatar' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Get user details for top posters (if they exist in User collection)
    const members = await Promise.all(
      topPosters.map(async (poster) => {
        // Try to find user by name or email
        const user = await User.findOne({
          $or: [
            { name: poster._id },
            { email: poster._id },
          ],
        }).lean()

        return {
          _id: user?._id?.toString() || poster._id,
          name: poster._id,
          avatar: poster.avatar || '👤',
          email: user?.email || null,
          postsCount: poster.count,
          createdAt: user?.createdAt || new Date(),
          title: `${poster.count} ${poster.count === 1 ? 'post' : 'posts'}`,
        }
      })
    )

    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    console.error('App-Community top-members GET error:', error)
    // Return empty array on error
    return NextResponse.json({ success: true, data: [] })
  }
}
