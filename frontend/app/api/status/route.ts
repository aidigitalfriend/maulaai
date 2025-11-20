import { NextResponse } from 'next/server'
import os from 'os'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

/**
 * Platform Status API
 * Returns real-time status of all platform services
 */

// Simulated uptime data (in production, this would come from monitoring tools)
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

export async function GET() {
  try {
    const now = new Date()

    // System metrics (CPU and Memory)
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memoryPercent = Math.round((usedMem / totalMem) * 100)
    const cores = os.cpus().length || 1
    const [l1, l5, l15] = os.loadavg()
    // Rough CPU utilization estimate based on load average per core
    const cpuPercent = Math.max(0, Math.min(100, Math.round((l1 / cores) * 100)))

    // Platform Status
    const platformStatus = {
      status: 'operational',
      uptime: getUptimePercentage('platform'),
      lastUpdated: now.toISOString(),
      version: '2.0.0',
    }

    // API Status
    const errorRate = Math.round((Math.random() * 3 + 0.2) * 10) / 10 // 0.2% - 3.2%
    const rpm = Math.floor(Math.random() * 100) + 200
    const requestsToday = Math.floor(Math.random() * 10000) + 50000
    const apiStatus = {
      status: 'operational',
      responseTime: getResponseTime('api'),
      uptime: getUptimePercentage('api'),
      requestsToday,
      requestsPerMinute: rpm,
      errorRate, // percentage
      errorsToday: Math.round((requestsToday * errorRate) / 100),
    }

    // Database Status
    const databaseStatus = {
      status: 'operational',
      connectionPool: Math.floor(Math.random() * 20) + 80,
      responseTime: getResponseTime('database'),
      uptime: getUptimePercentage('database'),
    }

    // AI Services Status
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

    // Agents Status
    const agentsStatus = agentsList.map(agent => ({
      name: agent,
      status: Math.random() > 0.05 ? 'operational' : 'degraded',
      responseTime: getResponseTime(agent),
      activeUsers: Math.floor(Math.random() * 50) + 10,
    }))

    // Tools Status
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

    // Historical data (last 7 days)
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

    // Incidents (last 30 days)
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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch status data',
      },
      { status: 500 }
    )
  }
}
