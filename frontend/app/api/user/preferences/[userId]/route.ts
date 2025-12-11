import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering so we always hit the backend
export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL || 'http://127.0.0.1:3005';

async function forwardToBackend(
  request: NextRequest,
  userId: string,
  method: 'GET' | 'PUT'
) {
  const backendUrl = new URL(
    `/api/user/preferences/${encodeURIComponent(userId)}`,
    BACKEND_BASE_URL
  );

  // For PUT we need to forward the request body as-is
  const body = method === 'PUT' ? await request.text() : undefined;

  const backendResponse = await fetch(backendUrl.toString(), {
    method,
    headers: {
      // Forward cookies so the backend can read session_id
      cookie: request.headers.get('cookie') ?? '',
      'content-type':
        request.headers.get('content-type') || 'application/json',
      'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
      'user-agent': request.headers.get('user-agent') ?? '',
    },
    body,
    cache: 'no-store',
  });

  const text = await backendResponse.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!backendResponse.ok) {
    // If backend returned structured JSON, pass it through
    if (data && typeof data === 'object') {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    const message =
      data && typeof data === 'string'
        ? data
        : method === 'GET'
        ? 'Failed to load preferences'
        : 'Failed to update preferences';

    return NextResponse.json(
      { message },
      { status: backendResponse.status || 500 }
    );
  }

  return NextResponse.json(data, { status: backendResponse.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    return await forwardToBackend(request, params.userId, 'GET');
  } catch (error) {
    console.error('Error proxying user preferences GET:', error);
    return NextResponse.json(
      { message: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    return await forwardToBackend(request, params.userId, 'PUT');
  } catch (error) {
    console.error('Error proxying user preferences PUT:', error);
    return NextResponse.json(
      { message: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
