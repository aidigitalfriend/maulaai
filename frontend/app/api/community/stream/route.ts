import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// =====================================================
// Fetch Real Metrics from Database
// =====================================================
async function fetchMetrics() {
  try {
    const totalMembers = await prisma.user.count();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const onlineNow = await prisma.user.count({
      where: {
        sessionExpiry: { gt: new Date() },
        lastLoginAt: { gte: oneMinuteAgo },
      },
    });

    const totalPosts = await prisma.communityPost.count();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const postsThisWeek = await prisma.communityPost.count({
      where: { createdAt: { gte: weekAgo } },
    });

    const postsWithReplies = await prisma.communityPost.aggregate({
      _sum: { repliesCount: true },
    });
    const activeReplies = postsWithReplies._sum.repliesCount || 0;

    const newMembersWeek = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    return {
      totalMembers,
      onlineNow: Math.max(1, onlineNow),
      totalPosts,
      postsThisWeek,
      activeReplies,
      newMembersWeek,
    };
  } catch (error) {
    console.error('Metrics fetch error:', error);
    return { totalMembers: 0, onlineNow: 1, totalPosts: 0, postsThisWeek: 0, activeReplies: 0, newMembersWeek: 0 };
  }
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let isConnected = true;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Community stream connected' })}\n\n`));

      try {
        const metrics = await fetchMetrics();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'metrics', data: metrics })}\n\n`));
      } catch (error) {
        console.error('Initial metrics error:', error);
      }

      const metricsInterval = setInterval(async () => {
        if (!isConnected) { clearInterval(metricsInterval); return; }
        try {
          const metrics = await fetchMetrics();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'metrics', data: metrics })}\n\n`));
        } catch (error) {
          console.error('Metrics update error:', error);
        }
      }, 15000);

      const heartbeatInterval = setInterval(() => {
        if (!isConnected) { clearInterval(heartbeatInterval); return; }
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`));
        } catch { clearInterval(heartbeatInterval); }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        isConnected = false;
        clearInterval(metricsInterval);
        clearInterval(heartbeatInterval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
