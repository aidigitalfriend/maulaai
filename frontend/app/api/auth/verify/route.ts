import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function proxyToBackend(request: NextRequest) {
  const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL('/api/auth/verify', backendBase);

  // Forward query parameters if any
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const response = await fetch(targetUrl.toString(), {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
    cache: 'no-store',
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type':
        response.headers.get('content-type') || 'application/json',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    return await proxyToBackend(request);
  } catch (error) {
    console.error('Error proxying /api/auth/verify:', error);
    return NextResponse.json(
      { valid: false, message: 'Session verification failed' },
      { status: 500 }
    );
  }
}

// Keep POST for AuthContext compatibility; proxy as well.
export async function POST(request: NextRequest) {
  return GET(request);
}
