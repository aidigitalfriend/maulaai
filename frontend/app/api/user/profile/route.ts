import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest, unauthorizedResponse } from '../../lib/validateAuth'

const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:3005'

async function proxyToBackend(request: NextRequest) {
  try {
    const url = new URL(request.url)
    // Rebuild backend path by keeping everything after /api
    const backendPath = url.pathname.replace(/^\/api/, '') || '/'
    const backendUrl = `${BACKEND_BASE}${backendPath}${url.search}`

    const init: RequestInit = {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: undefined,
    }

    // For user profile, always require authentication
    const result = verifyRequest(request)
    if (!result.ok) return unauthorizedResponse(result.error)
    
    // Add user info from JWT to headers for backend
    init.headers = {
      ...init.headers,
      'x-user-id': result.decoded.id || result.decoded.userId,
      'x-user-email': result.decoded.email,
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.text()
    }

    const res = await fetch(backendUrl, init)
    const text = await res.text()

    return new NextResponse(text, {
      status: res.status,
      headers: res.headers as any,
    })
  } catch (error: any) {
    console.error('[/api/user/profile] Proxy error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Proxy error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return proxyToBackend(request)
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request)
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request)
}