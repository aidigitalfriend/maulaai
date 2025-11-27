import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookie = request.headers.get('cookie')
    
    const response = await fetch(`${BACKEND_URL}/api/session/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie && { 'Cookie': cookie })
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Session profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}