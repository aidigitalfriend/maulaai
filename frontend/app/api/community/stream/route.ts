import { NextRequest } from 'next/server'
import dbConnect from '../../../../../backend/lib/mongodb'
import User from '../../../../../backend/models/User'
import CommunityPost from '../../../../../backend/models/CommunityPost'
import CommunityComment from '../../../../../backend/models/CommunityComment'
import Presence from '../../../../../backend/models/Presence'

export const runtime = 'nodejs'

function sseHeaders() {
  return new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
}

async function computeMetrics() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const [totalMembers, newMembersWeek, onlineNow, totalPosts, postsThisWeek, activeReplies] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Presence.countDocuments({ lastSeen: { $gte: fiveMinAgo }, userId: { $ne: null } }),
    CommunityPost.countDocuments({}),
    CommunityPost.countDocuments({ createdAt: { $gte: weekAgo } }),
    CommunityComment.countDocuments({ createdAt: { $gte: weekAgo } }),
  ])
  return { totalMembers, onlineNow, totalPosts, postsThisWeek, activeReplies, newMembersWeek }
}

export async function GET(_req: NextRequest) {
  await dbConnect()

  const stream = new ReadableStream({
    start(controller) {
      const write = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
      }

      // Send initial metrics immediately
      computeMetrics().then((m) => write({ type: 'metrics', data: m }))

      // Polling interval for metrics every 5 seconds
      const interval = setInterval(async () => {
        try {
          const m = await computeMetrics()
          write({ type: 'metrics', data: m })
        } catch (e) {
          // ignore
        }
      }, 5000)

      const keepAlive = setInterval(() => {
        controller.enqueue(': ping\n\n')
      }, 15000)

      return () => {
        clearInterval(interval)
        clearInterval(keepAlive)
      }
    },
  })

  return new Response(stream, { headers: sseHeaders() })
}
