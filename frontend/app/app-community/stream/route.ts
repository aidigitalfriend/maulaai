import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_BASE}/api/community/stream${url.search}`
    
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: Object.fromEntries(request.headers),
    })
    
    const text = await res.text()

    return new NextResponse(text, {
      status: res.status,
      headers: res.headers as any,
    })
  } catch (error: any) {
    console.error('[/app-community/stream] Proxy error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Proxy error' }, { status: 500 })
  }
}
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
