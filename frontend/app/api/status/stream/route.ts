import { NextResponse } from 'next/server'
import os from 'os'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

/**
 * Server-Sent Events (SSE) endpoint for real-time status updates
 * Streams status data to clients every 10 seconds
 */

const getUptimePercentage = (serviceName: string) => {
  const baseUptime = 99.5
  const variance = Math.random() * 1
  return Math.min(100, baseUptime + variance)
}

const getResponseTime = (serviceName: string) => {
  const baseTime = Math.random() * 200 + 50
  return Math.round(baseTime)
}

const agentsList = [
  'einstein', 'ben-sega', 'chess-player', 'comedy-king', 'drama-queen',
  'mrs-boss', 'fitness-guru', 'chef-biew', 'lazy-pawn', 'knight-logic',
  'rook-jokey', 'emma-emotional', 'julie-girlfriend', 'professor-astrology',
  'nid-gaming', 'tech-wizard', 'travel-buddy', 'bishop-burger'
]

const generateStatusData = () => {
  const now = new Date()

  // System metrics
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const memoryPercent = Math.round((usedMem / totalMem) * 100)
  const cores = os.cpus().length || 1
  const [l1, l5, l15] = os.loadavg()
  const cpuPercent = Math.max(0, Math.min(100, Math.round((l1 / cores) * 100)))

  const platformStatus = {
    status: 'operational',
    uptime: getUptimePercentage('platform'),
    lastUpdated: now.toISOString(),
    version: '2.0.0',
  }

  const errorRate = Math.round((Math.random() * 3 + 0.2) * 10) / 10
  const rpm = Math.floor(Math.random() * 100) + 200
  const requestsToday = Math.floor(Math.random() * 10000) + 50000
  const apiStatus = {
    status: 'operational',
    responseTime: getResponseTime('api'),
    uptime: getUptimePercentage('api'),
    requestsToday,
    requestsPerMinute: rpm,
    errorRate,
    errorsToday: Math.round((requestsToday * errorRate) / 100),
  }

  const databaseStatus = {
    status: 'operational',
    connectionPool: Math.floor(Math.random() * 20) + 80,
    responseTime: getResponseTime('database'),
    uptime: getUptimePercentage('database'),
  }

  const aiServices = [
    {
      name: 'Gemini Pro',
      status: 'operational',
      responseTime: getResponseTime('gemini'),
      uptime: getUptimePercentage('gemini'),
    },
    {
      name: 'OpenAI GPT',
      status: 'operational',
      responseTime: getResponseTime('openai'),
      uptime: getUptimePercentage('openai'),
    },
    {
      name: 'Claude',
      status: 'operational',
      responseTime: getResponseTime('claude'),
      uptime: getUptimePercentage('claude'),
    },
  ]

  const agentsStatus = agentsList.map(agent => ({
    name: agent,
    status: Math.random() > 0.05 ? 'operational' : 'degraded',
    responseTime: getResponseTime(agent),
    activeUsers: Math.floor(Math.random() * 50) + 10,
  }))

  const toolsStatus = [
    {
      name: 'IP Info',
      status: 'operational',
      responseTime: getResponseTime('ip-info'),
    },
    {
      name: 'Network Tools',
      status: 'operational',
      responseTime: getResponseTime('network-tools'),
    },
    {
      name: 'Developer Utils',
      status: 'operational',
      responseTime: getResponseTime('dev-utils'),
    },
    {
      name: 'API Tester',
      status: 'operational',
      responseTime: getResponseTime('api-tester'),
    },
    {
      name: 'AI Studio',
      status: 'operational',
      responseTime: getResponseTime('studio'),
      activeChats: Math.floor(Math.random() * 100) + 50,
    },
  ]

  const historicalData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      uptime: getUptimePercentage('historical'),
      requests: Math.floor(Math.random() * 50000) + 100000,
      avgResponseTime: getResponseTime('historical'),
    }
  })

  const incidents = [
    {
      id: 1,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Scheduled Maintenance',
      severity: 'maintenance',
      duration: '2 hours',
      resolved: true,
    },
    {
      id: 2,
      date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'API Rate Limiting Adjustment',
      severity: 'minor',
      duration: '30 minutes',
      resolved: true,
    },
  ]

  return {
    success: true,
    timestamp: now.toISOString(),
    data: {
      system: {
        cpuPercent,
        memoryPercent,
        totalMem,
        freeMem,
        usedMem,
        load1: l1,
        load5: l5,
        load15: l15,
        cores,
      },
      platform: platformStatus,
      api: apiStatus,
      database: databaseStatus,
      aiServices,
      agents: agentsStatus,
      tools: toolsStatus,
      historical: historicalData,
      incidents,
    },
  }
}

export async function GET(req: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      let interval: NodeJS.Timeout | undefined

      const safeEnqueue = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch (err) {
          // If the controller is already closed, stop the stream loop
          closed = true
          if (interval) clearInterval(interval)
          try { controller.close() } catch {}
        }
      }

      const cleanup = () => {
        if (closed) return
        closed = true
        if (interval) clearInterval(interval)
        try { controller.close() } catch {}
      }

      // Abort/disconnect handling
      try {
        // @ts-ignore: Request in Next has a standard AbortSignal
        const signal: AbortSignal | undefined = req?.signal
        signal?.addEventListener('abort', cleanup)
      } catch {}

      try {
        // Send initial data immediately
        const initialData = generateStatusData()
        safeEnqueue(`data: ${JSON.stringify(initialData)}\n\n`)

        // Send updates every 10 seconds
        interval = setInterval(() => {
          try {
            const data = generateStatusData()
            safeEnqueue(`data: ${JSON.stringify(data)}\n\n`)
          } catch (error) {
            console.error('Error generating status data:', error)
          }
        }, 10000)

        // Hard stop after 5 minutes as a safety net
        setTimeout(cleanup, 5 * 60 * 1000)
      } catch (error) {
        console.error('SSE stream error:', error)
        try { controller.error(error as any) } catch {}
        cleanup()
      }
    },
    cancel() {
      // Called if the consumer cancels the stream
      // Nothing additional needed; start() cleanup handles it
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
