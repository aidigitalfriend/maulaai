import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with actual DB queries
const generateMetricsData = (days: number) => {
  const data = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: Math.floor(Math.random() * 2000) + 1500,
      latency: Math.floor(Math.random() * 800) + 150,
      successRate: Math.floor(Math.random() * 10) + 90,
      failureRate: Math.floor(Math.random() * 10),
      tokenUsage: Math.floor(Math.random() * 50000) + 20000,
      responseSize: Math.floor(Math.random() * 500) + 100
    })
  }
  
  return data
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const endpoint = searchParams.get('endpoint')
  const days = parseInt(searchParams.get('days') || '7')
  
  // Verify authentication token
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    let data

    switch (endpoint) {
      case 'metrics':
        data = generateMetricsData(days)
        break

      case 'model-usage':
        data = [
          { model: 'GPT-4', usage: 35, percentage: 35, color: '#6366f1' },
          { model: 'Claude-3', usage: 28, percentage: 28, color: '#ec4899' },
          { model: 'Gemini 2.0', usage: 22, percentage: 22, color: '#14b8a6' },
          { model: 'Llama 2', usage: 15, percentage: 15, color: '#f59e0b' }
        ]
        break

      case 'success-failure': {
        const metrics = generateMetricsData(7)
        data = metrics.map((metric, idx) => ({
          day: `Day ${idx + 1}`,
          successful: Math.floor(metric.requests * (metric.successRate / 100)),
          failed: Math.floor(metric.requests * (metric.failureRate / 100))
        }))
        break
      }

      case 'token-usage': {
        const metrics = generateMetricsData(7)
        data = metrics.map(metric => ({
          date: metric.date,
          tokens: metric.tokenUsage
        }))
        break
      }

      case 'geographic':
        data = [
          { region: 'North America', requests: 3500, percentage: 45 },
          { region: 'Europe', requests: 2100, percentage: 27 },
          { region: 'Asia Pacific', requests: 1800, percentage: 23 },
          { region: 'Others', requests: 300, percentage: 5 }
        ]
        break

      case 'peak-traffic':
        data = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          requests: Math.floor(Math.random() * 1000) + (i >= 8 && i <= 18 ? 500 : 100)
        }))
        break

      case 'error-breakdown':
        data = [
          { type: '4xx Errors', count: 145, percentage: 70 },
          { type: '5xx Errors', count: 38, percentage: 18 },
          { type: 'Timeouts', count: 22, percentage: 12 }
        ]
        break

      case 'response-size': {
        const metrics = generateMetricsData(7)
        data = metrics.map(metric => ({
          date: metric.date,
          size: metric.responseSize
        }))
        break
      }

      case 'cost-estimation':
        data = [
          { model: 'GPT-4', cost: 245.50, percentage: 45 },
          { model: 'Claude-3', cost: 156.30, percentage: 28 },
          { model: 'Gemini 2.0', cost: 98.75, percentage: 18 },
          { model: 'Llama 2', cost: 45.20, percentage: 8 }
        ]
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown endpoint' },
          { status: 400 }
        )
    }

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
