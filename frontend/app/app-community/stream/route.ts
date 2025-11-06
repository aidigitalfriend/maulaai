import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sseHeaders() {
  return new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  // Determine DB availability first; avoid importing DB code if not configured
  const hasMongo = !!process.env.MONGODB_URI
  let computeMetrics: (() => Promise<{ totalMembers: number; newMembersWeek: number; onlineNow: number; totalPosts: number; postsThisWeek: number; activeReplies: number }>) | null = null

  if (hasMongo) {
    try {
      const [{ default: dbConnect }, { default: User }, { default: CommunityPost }, { default: CommunityComment }, { default: Presence }] = await Promise.all([
        import('../../../../backend/lib/mongodb'),
        import('../../../../backend/models/User'),
        import('../../../../backend/models/CommunityPost'),
        import('../../../../backend/models/CommunityComment'),
        import('../../../../backend/models/Presence'),
      ])
      await dbConnect()

      computeMetrics = async () => {
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
    } catch {
      // If dynamic import/connect fails, fall back to mock mode
      computeMetrics = null
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      let interval: NodeJS.Timeout | undefined
      let keepAlive: NodeJS.Timeout | undefined

      const safeEnqueue = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          closed = true
          if (interval) clearInterval(interval)
          if (keepAlive) clearInterval(keepAlive)
          try { controller.close() } catch {}
        }
      }

      const cleanup = () => {
        if (closed) return
        closed = true
        if (interval) clearInterval(interval)
        if (keepAlive) clearInterval(keepAlive)
        try { controller.close() } catch {}
      }

      // Handle client abort/disconnect
      try { req.signal?.addEventListener('abort', cleanup) } catch {}

      // Initial payload
      if (computeMetrics) {
        computeMetrics().then((m) => safeEnqueue(`data: ${JSON.stringify({ type: 'metrics', data: m })}\n\n`)).catch(() => {
          safeEnqueue(`data: ${JSON.stringify({ type: 'metrics', data: realMetrics() })}\n\n`)
        })
      } else {
        safeEnqueue(`data: ${JSON.stringify({ type: 'metrics', data: realMetrics() })}\n\n`)
      }

      // Poll every 5s
      interval = setInterval(async () => {
        try {
          if (computeMetrics) {
            const m = await computeMetrics()
            safeEnqueue(`data: ${JSON.stringify({ type: 'metrics', data: m })}\n\n`)
          } else {
            safeEnqueue(`data: ${JSON.stringify({ type: 'metrics', data: realMetrics() })}\n\n`)
          }
        } catch {
          // ignore per-iteration error; next tick will retry
        }
      }, 5000)

      // Heartbeat to keep proxies happy
      keepAlive = setInterval(() => {
        safeEnqueue(`: ping\n\n`)
      }, 15000)

      // Hard timeout after 10 minutes
      setTimeout(cleanup, 10 * 60 * 1000)

      return cleanup
    },
    cancel() {
      // upstream cancellation handled by cleanup
    },
  })

  return new Response(stream, { headers: sseHeaders() })
}

function realMetrics() {
  // Return real zeros when DB is not available - no fake numbers!
  return {
    totalMembers: 0,
    newMembersWeek: 0,
    onlineNow: 0,
    totalPosts: 0,
    postsThisWeek: 0,
    activeReplies: 0,
  }
}
