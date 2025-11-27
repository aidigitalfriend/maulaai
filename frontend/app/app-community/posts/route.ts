import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest, unauthorizedResponse } from '../../../lib/validateAuth'

const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:3005'

async function proxyToCommunityBackend(request: NextRequest, endpoint: string) {
  try {
    const url = new URL(request.url)
    const backendUrl = `${BACKEND_BASE}/api/community${endpoint}${url.search}`
    
    const init: RequestInit = {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: undefined,
    }

    // Require auth for POST methods (creating posts)
    if (request.method === 'POST') {
      const result = verifyRequest(request)
      if (!result.ok) return unauthorizedResponse(result.error)
      init.body = await request.text()
    }

    const res = await fetch(backendUrl, init)
    const text = await res.text()

    return new NextResponse(text, {
      status: res.status,
      headers: res.headers as any,
    })
  } catch (error: any) {
    console.error('[/app-community/posts] Proxy error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Proxy error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return proxyToCommunityBackend(request, '/posts')
}

export async function POST(request: NextRequest) {
  return proxyToCommunityBackend(request, '/posts')
}
