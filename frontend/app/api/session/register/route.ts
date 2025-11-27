import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/session/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // Create response with session cookie from backend
    const nextResponse = NextResponse.json(data, { status: response.status })
    
    // Forward session cookie from backend
    const sessionCookie = response.headers.get('set-cookie')
    if (sessionCookie) {
      nextResponse.headers.set('set-cookie', sessionCookie)
    }

    return nextResponse
  } catch (error) {
    console.error('Session register error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}