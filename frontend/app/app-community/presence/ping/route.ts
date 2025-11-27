import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Proxy to backend community API (presence ping endpoint)
    const body = await req.json().catch(() => ({}))
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/community/presence/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Community presence ping proxy error:', error)
    return NextResponse.json({ 
      error: 'Failed to ping presence', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
