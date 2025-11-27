import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005'

export async function POST(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookie = request.headers.get('cookie')
    
    const response = await fetch(`${BACKEND_URL}/api/session/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie && { 'Cookie': cookie })
      }
    })

    const data = await response.json()

    // Create response and clear session cookie
    const nextResponse = NextResponse.json(data, { status: response.status })
    
    // Clear session cookie
    nextResponse.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return nextResponse
  } catch (error) {
    console.error('Session logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}