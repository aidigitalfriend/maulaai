import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Status Analytics API
 * Returns comprehensive analytics data for the platform
 */

const agentsList = [
  'Einstein AI', 'Ben Sega', 'Chess Player', 'Comedy King', 'Drama Queen',
  'Mrs Boss', 'Fitness Guru', 'Chef Biew', 'Lazy Pawn', 'Knight Logic',
  'Rook Jokey', 'Emma Emotional', 'Julie Girlfriend', 'Professor Astrology',
  'Nid Gaming', 'Tech Wizard', 'Travel Buddy', 'Bishop Burger'
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'

    // Generate realistic analytics data
    const analyticsData = {
      overview: {
        totalRequests: Math.floor(Math.random() * 50000) + 200000,
        activeUsers: Math.floor(Math.random() * 500) + 2000,
        avgResponseTime: Math.floor(Math.random() * 100) + 150,
        successRate: 99.5 + Math.random() * 0.5,
        requestsGrowth: Math.random() * 20 - 5,
        usersGrowth: Math.random() * 15 - 3,
      },
      agents: agentsList.map(name => ({
        name,
        requests: Math.floor(Math.random() * 10000) + 5000,
        users: Math.floor(Math.random() * 200) + 50,
        avgResponseTime: Math.floor(Math.random() * 150) + 100,
        successRate: 98 + Math.random() * 2,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
      })),
      tools: [
        { 
          name: 'AI Studio', 
          usage: Math.floor(Math.random() * 5000) + 15000, 
          users: Math.floor(Math.random() * 200) + 800, 
          avgDuration: Math.floor(Math.random() * 300) + 1200, 
          trend: 'up' 
        },
        { 
          name: 'IP Info', 
          usage: Math.floor(Math.random() * 2000) + 8000, 
          users: Math.floor(Math.random() * 150) + 600, 
          avgDuration: Math.floor(Math.random() * 20) + 50, 
          trend: 'up' 
        },
        { 
          name: 'Network Tools', 
          usage: Math.floor(Math.random() * 1500) + 5000, 
          users: Math.floor(Math.random() * 100) + 400, 
          avgDuration: Math.floor(Math.random() * 100) + 300, 
          trend: 'stable' 
        },
        { 
          name: 'Developer Utils', 
          usage: Math.floor(Math.random() * 1000) + 4500, 
          users: Math.floor(Math.random() * 80) + 350, 
          avgDuration: Math.floor(Math.random() * 60) + 180, 
          trend: 'up' 
        },
        { 
          name: 'API Tester', 
          usage: Math.floor(Math.random() * 1500) + 6000, 
          users: Math.floor(Math.random() * 100) + 450, 
          avgDuration: Math.floor(Math.random() * 150) + 420, 
          trend: 'stable' 
        },
      ],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        requests: Math.floor(Math.random() * 5000) + 8000,
        users: Math.floor(Math.random() * 200) + 300,
      })),
      topAgents: agentsList
        .slice(0, 5)
        .map(name => ({
          name,
          requests: Math.floor(Math.random() * 15000) + 10000,
          percentage: Math.random() * 100,
        }))
        .sort((a, b) => b.requests - a.requests),
      timeRange,
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
