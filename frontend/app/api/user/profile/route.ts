import { NextRequest, NextResponse } from 'next/server';

// Force dynamic so we always validate the live session
export const dynamic = 'force-dynamic';

const backendBase = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3005';

async function proxy(request: NextRequest, method: 'GET' | 'PUT') {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL('/api/user/profile', backendBase);

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const init: RequestInit = {
    method,
    headers: {
      cookie: request.headers.get('cookie') || '',
      'content-type': request.headers.get('content-type') || 'application/json',
    },
    cache: 'no-store',
  };

  if (method === 'PUT') {
    const bodyBuffer = await request.arrayBuffer();
    init.body = bodyBuffer;
  }

  const response = await fetch(targetUrl.toString(), init);
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
    return await proxy(request, 'GET');
  } catch (error) {
    console.error('Error proxying /api/user/profile (GET):', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await proxy(request, 'PUT');
  } catch (error) {
    console.error('Error proxying /api/user/profile (PUT):', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
