import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005'

export async function GET(request: NextRequest) {
  try {
    // Forward user identification headers
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    // Get user ID from session/auth (simplified for now)
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['x-user-id'] = 'authenticated-user'
    } else {
      headers['x-user-id'] = 'anonymous'
    }

    const response = await fetch(`${BACKEND_URL}/api/studio/session`, {
      method: 'GET',
      headers
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('AI Studio session get error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get session' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward user identification headers
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    // Get user ID from session/auth (simplified for now)
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['x-user-id'] = 'authenticated-user'
    } else {
      headers['x-user-id'] = 'anonymous'
    }

    const response = await fetch(`${BACKEND_URL}/api/studio/session`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('AI Studio session update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Forward user identification headers
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    // Get user ID from session/auth (simplified for now)
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['x-user-id'] = 'authenticated-user'
    } else {
      headers['x-user-id'] = 'anonymous'
    }

    const response = await fetch(`${BACKEND_URL}/api/studio/session`, {
      method: 'DELETE',
      headers
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('AI Studio session clear error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear session' },
      { status: 500 }
    )
  }
}