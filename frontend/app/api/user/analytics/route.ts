import { NextResponse } from 'next/server'

// Force dynamic rendering so we always hit the backend
export const dynamic = 'force-dynamic'

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL || 'http://127.0.0.1:3005'

export async function GET(request: Request) {
  try {
    const incomingUrl = new URL(request.url)
    const backendUrl = new URL('/api/user/analytics', BACKEND_BASE_URL)
    // Preserve any query params (e.g. userId/email for debugging)
    backendUrl.search = incomingUrl.search

    const backendResponse = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        // Forward cookies so the backend can read session_id
        cookie: request.headers.get('cookie') ?? '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        'user-agent': request.headers.get('user-agent') ?? '',
      },
      // Never cache analytics; always fetch fresh data
      cache: 'no-store',
    })

    const text = await backendResponse.text()
    let data: unknown = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }

    if (!backendResponse.ok) {
      const errorMessage =
        data && typeof data === 'object'
          ? // @ts-expect-error dynamic backend error shape
            (data.error || data.message || 'Failed to fetch analytics data')
          : 'Failed to fetch analytics data'

      return NextResponse.json(
        { error: errorMessage },
        { status: backendResponse.status },
      )
    }

    // Backend already returns the exact shape the dashboard expects
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying user analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 },
    )
  }
}
