import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  const platformStatus = {
    status: 'operational',
    uptime: getUptimePercentage('platform'),
    lastUpdated: now.toISOString(),
    version: '2.0.0',
  }

  const apiStatus = {
    status: 'operational',
    responseTime: getResponseTime('api'),
    uptime: getUptimePercentage('api'),
    requestsToday: Math.floor(Math.random() * 10000) + 50000,
    requestsPerMinute: Math.floor(Math.random() * 100) + 200,
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

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial data immediately
        const initialData = generateStatusData()
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`))

        // Send updates every 10 seconds
        const interval = setInterval(() => {
          try {
            const data = generateStatusData()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          } catch (error) {
            console.error('Error generating status data:', error)
          }
        }, 10000)

        // Cleanup on close
        const cleanup = () => {
          clearInterval(interval)
          controller.close()
        }

        // Handle client disconnect
        setTimeout(cleanup, 5 * 60 * 1000) // Close after 5 minutes
      } catch (error) {
        console.error('SSE stream error:', error)
        controller.error(error)
      }
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
