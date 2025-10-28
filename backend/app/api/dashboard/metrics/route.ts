import { NextRequest, NextResponse } from 'next/server'

// Verify user authentication
const verifyAuth = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Generate mock metrics data
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

// API Metrics endpoint
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '7')
  
  try {
    const data = generateMetricsData(days)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
