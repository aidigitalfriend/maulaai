import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// GET /api/x-community/top-members - Proxy to backend community API for consistency with app-community routes
export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/community/top-members`)

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Community top-members proxy error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch top members', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
